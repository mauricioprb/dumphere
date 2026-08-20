import http from 'node:http';
import { createRequire } from 'node:module';
import pg from 'pg';
import { WebSocketServer } from 'ws';
import {
    gateFor,
    isAllowedOrigin,
    resolveClientIp,
    roomFromPathname,
    tokenFromProtocols,
    verifyToken,
} from './auth.mjs';
import { isWriteMessage } from './scope.mjs';
import { createPostgresPersistence, documentIdFromRoom } from './persistence.mjs';
import { createMessageRateLimiter, guardMessageHandlers } from './rate-limit.mjs';

const require = createRequire(import.meta.url);
const { docs, setPersistence, setupWSConnection } = require('y-websocket/bin/utils');
const { Pool } = pg;

const HOST = process.env.HOST || '127.0.0.1';
const PORT = parseInteger(process.env.PORT, 1234);
const WS_SECRET = process.env.YJS_WS_SECRET || process.env.APP_KEY || '';
const MAX_CONNECTIONS_PER_IP = parseInteger(process.env.YJS_MAX_CONNECTIONS_PER_IP, 10);
const MAX_MESSAGES_PER_SECOND = parseInteger(process.env.YJS_MAX_MESSAGES_PER_SECOND, 30);
const MAX_MESSAGE_BURST = parseInteger(process.env.YJS_MAX_MESSAGE_BURST, MAX_MESSAGES_PER_SECOND * 4);
const MAX_PAYLOAD_BYTES = parseInteger(process.env.YJS_MAX_PAYLOAD_BYTES, 1_048_576);
const MAX_DOCUMENT_BYTES = parseInteger(process.env.YJS_MAX_DOCUMENT_BYTES, 2_097_152);
const TRUST_PROXY = process.env.YJS_TRUST_PROXY === 'true';
const TRUSTED_PROXIES = new Set(
    (process.env.YJS_TRUSTED_PROXIES || '127.0.0.1,::1')
        .split(',')
        .map((address) => address.trim())
        .filter(Boolean),
);
const ALLOWED_ORIGINS = new Set(
    (process.env.YJS_ALLOWED_ORIGINS || process.env.APP_URL || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
);

if (!WS_SECRET) {
    throw new Error('YJS_WS_SECRET or APP_KEY is required');
}

if (ALLOWED_ORIGINS.size === 0) {
    throw new Error('YJS_ALLOWED_ORIGINS or APP_URL is required');
}

const MODE_CHANGED_CODE = 4001;
const DELETED_CODE = 4002;
let modeListener = null;
let shuttingDown = false;
const connections = new Map();

const pool = new Pool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInteger(process.env.DB_PORT, 5432),
    database: process.env.DB_DATABASE || 'md_editor',
    user: process.env.DB_USERNAME || 'md_editor',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSLMODE === 'require' ? { rejectUnauthorized: true } : false,
    max: parseInteger(process.env.YJS_DB_POOL_SIZE, 5),
    connectionTimeoutMillis: 5000,
    query_timeout: 5000,
    statement_timeout: 5000,
});
const persistence = createPostgresPersistence(pool, {
    logger: createLogger(),
    maxStateBytes: MAX_DOCUMENT_BYTES,
    onStateTooLarge(room, sizeBytes) {
        log('warn', 'Yjs document exceeded its size limit', { room, sizeBytes });
        docs.get(room)?.conns.forEach((_controlledIds, connection) => {
            connection.close(1009, 'Document size exceeded');
        });
    },
});
const connectionsByIp = new Map();

setPersistence(persistence);

const server = http.createServer(async (request, response) => {
    if (request.url !== '/' && request.url !== '/health') {
        response.writeHead(404);
        response.end();
        return;
    }

    try {
        await pool.query('SELECT 1');
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: 'ok' }));
    } catch {
        response.writeHead(503, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: 'unavailable' }));
    }
});

const wss = new WebSocketServer({
    noServer: true,
    maxPayload: MAX_PAYLOAD_BYTES,
    perMessageDeflate: false,
    handleProtocols(protocols) {
        return protocols.has('yjs') ? 'yjs' : false;
    },
});

server.on('upgrade', (request, socket, head) => {
    void authorizeAndUpgrade(request, socket, head);
});

async function authorizeAndUpgrade(request, socket, head) {
    let reservedIp = null;

    try {
        const url = new URL(request.url || '/', 'http://localhost');
        const origin = request.headers.origin;
        const token = tokenFromProtocols(request.headers['sec-websocket-protocol']);
        const room = roomFromPathname(url.pathname);
        const tokenResult = verifyToken(token, WS_SECRET);
        const ip = resolveClientIp(
            request.headers['x-forwarded-for'],
            socket.remoteAddress,
            TRUST_PROXY,
            TRUSTED_PROXIES,
        );

        if (!isAllowedOrigin(origin, ALLOWED_ORIGINS)) {
            rejectUpgrade(socket, 403, 'Forbidden');
            return;
        }

        if (!tokenResult.valid || room === null || tokenResult.room !== room) {
            rejectUpgrade(socket, 403, 'Forbidden');
            return;
        }

        if ((connectionsByIp.get(ip) ?? 0) >= MAX_CONNECTIONS_PER_IP) {
            rejectUpgrade(socket, 429, 'Too Many Requests');
            return;
        }

        connectionsByIp.set(ip, (connectionsByIp.get(ip) ?? 0) + 1);
        reservedIp = ip;

        const result = await pool.query(
            `SELECT d.slug AS slug,
                    split_part(d.slug, '/', 1) AS root,
                    COALESCE(owner.readonly, false) AS readonly,
                    owner.visitor_password_hash AS visitor_password_hash,
                    owner.owner_session_id AS owner_session_id
             FROM documents d
             LEFT JOIN documents owner
               ON owner.slug = split_part(d.slug, '/', 1)
              AND owner.paid_until > now()
             WHERE d.id = $1
             LIMIT 1`,
            [tokenResult.documentId],
        );

        if (result.rowCount === 0) {
            releaseConnection(ip);
            reservedIp = null;
            rejectUpgrade(socket, 404, 'Not Found');
            return;
        }

        const {
            slug,
            root,
            readonly,
            visitor_password_hash: visitorPasswordHash,
            owner_session_id: ownerSessionId,
        } = result.rows[0];

        if (tokenResult.gate !== gateFor(readonly, visitorPasswordHash, ownerSessionId)) {
            releaseConnection(ip);
            reservedIp = null;
            rejectUpgrade(socket, 403, 'Forbidden');
            return;
        }

        const scope = readonly || tokenResult.scope === 'read' ? 'read' : 'write';

        wss.handleUpgrade(request, socket, head, (ws) => {
            reservedIp = null;
            wss.emit('connection', ws, request, { ip, room, scope, root, slug });
        });
    } catch {
        if (reservedIp !== null) releaseConnection(reservedIp);
        rejectUpgrade(socket, 503, 'Service Unavailable');
    }
}

wss.on('connection', (ws, request, { ip, room, scope, root, slug }) => {
    const consumeMessage = createMessageRateLimiter(MAX_MESSAGES_PER_SECOND, undefined, MAX_MESSAGE_BURST);
    const acceptMessage = scope === 'read' ? (payload) => !isWriteMessage(payload) : undefined;
    const removeMessageGuard = guardMessageHandlers(ws, consumeMessage, acceptMessage);

    connections.set(ws, { root, slug, room });

    ws.once('close', () => {
        connections.delete(ws);
        releaseConnection(ip);
    });

    setupWSConnection(ws, request, { docName: room });
    removeMessageGuard();
});

async function listenForModeChanges() {
    if (shuttingDown) return;

    const client = await pool.connect();
    modeListener = client;

    client.on('notification', ({ channel, payload }) => {
        const deleted = channel === 'dumphere_deleted';

        for (const [ws, connection] of connections) {
            const affected = deleted
                ? connection.slug === payload || connection.slug.startsWith(`${payload}/`)
                : connection.root === payload;

            if (!affected) continue;

            if (deleted) {
                docs.get(connection.room)?.destroy();
                docs.delete(connection.room);
            }

            ws.close(deleted ? DELETED_CODE : MODE_CHANGED_CODE, deleted ? 'Page deleted' : 'Mode changed');
        }
    });

    client.on('error', (error) => {
        modeListener = null;
        client.release(error);
        log('error', 'Mode change listener failed; retrying', { message: error.message });
        setTimeout(() => void listenForModeChanges(), 5000);
    });

    await client.query('LISTEN dumphere_mode');
    await client.query('LISTEN dumphere_deleted');
    log('info', 'Listening for address mode changes');
}

void listenForModeChanges().catch((error) => {
    log('error', 'Could not listen for address mode changes', { message: error.message });
});

server.listen(PORT, HOST, () => {
    log('info', 'Yjs server started', {
        host: HOST,
        port: PORT,
        allowedOrigins: ALLOWED_ORIGINS.size,
    });
});

for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
        void shutdown(signal);
    });
}

async function shutdown(signal) {
    shuttingDown = true;
    log('info', 'Yjs server shutting down', { signal });
    server.close();
    wss.close();

    modeListener?.release();
    modeListener = null;

    await Promise.allSettled(
        Array.from(docs.entries()).map(([room, document]) => persistence.writeState(room, document)),
    );
    await pool.end();
    process.exit(0);
}

function rejectUpgrade(socket, status, message) {
    if (socket.destroyed) return;
    socket.write(`HTTP/1.1 ${status} ${message}\r\nConnection: close\r\n\r\n`);
    socket.destroy();
}

function releaseConnection(ip) {
    const remaining = Math.max(0, (connectionsByIp.get(ip) ?? 1) - 1);
    if (remaining === 0) connectionsByIp.delete(ip);
    else connectionsByIp.set(ip, remaining);
}

function parseInteger(value, fallback) {
    const parsed = Number.parseInt(value || '', 10);

    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function createLogger() {
    return {
        error(message, context = {}) {
            log('error', message, context);
        },
        warn(message, context = {}) {
            log('warn', message, context);
        },
    };
}

function log(level, message, context = {}) {
    process.stdout.write(
        `${JSON.stringify({
            timestamp: new Date().toISOString(),
            level,
            message,
            ...context,
        })}\n`,
    );
}

export { documentIdFromRoom };
