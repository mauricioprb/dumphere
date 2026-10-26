import crypto from 'node:crypto';
import http from 'node:http';
import { createRequire } from 'node:module';
import { Client, Query, TablesDB } from 'node-appwrite';
import { WebSocketServer } from 'ws';
import {
    gateFor,
    isAllowedOrigin,
    resolveClientIp,
    roomFromPathname,
    signingSecret,
    tokenFromProtocols,
    verifyToken,
} from './auth.mjs';
import { isWriteMessage } from './scope.mjs';
import { createPersistence, documentIdFromRoom } from './persistence.mjs';
import { createMessageRateLimiter, guardMessageHandlers } from './rate-limit.mjs';

const require = createRequire(import.meta.url);
const { docs, setPersistence, setupWSConnection } = require('y-websocket/bin/utils');

const HOST = process.env.HOST || '127.0.0.1';
const PORT = parseInteger(process.env.PORT, 1234);
const WS_SECRET = signingSecret();
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

if (ALLOWED_ORIGINS.size === 0) {
    throw new Error('YJS_ALLOWED_ORIGINS or APP_URL is required');
}

const MODE_CHANGED_CODE = 4001;
const DELETED_CODE = 4002;
const DATABASE_ID = 'dumphere';
const DOCUMENTS_TABLE = 'documents';
const connections = new Map();

const tablesDB = new TablesDB(
    new Client()
        .setEndpoint(requiredEnvironment('APPWRITE_ENDPOINT'))
        .setProject(requiredEnvironment('APPWRITE_PROJECT_ID'))
        .setKey(requiredEnvironment('APPWRITE_API_KEY')),
);
const store = {
    async load(documentId) {
        const row = await tablesDB.getRow({
            databaseId: DATABASE_ID,
            tableId: DOCUMENTS_TABLE,
            rowId: documentId,
            queries: [Query.select(['yjsState'])],
        });

        return row.yjsState ?? null;
    },
    async save(documentId, stateBase64) {
        try {
            await tablesDB.updateRow({
                databaseId: DATABASE_ID,
                tableId: DOCUMENTS_TABLE,
                rowId: documentId,
                data: { yjsState: stateBase64 },
            });

            return true;
        } catch (error) {
            if (error?.code === 404) return false;
            throw error;
        }
    },
};
const persistence = createPersistence(store, {
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

const server = http.createServer((request, response) => {
    if (request.method === 'POST' && request.url === '/notify') {
        void receiveNotification(request, response);
        return;
    }

    if (request.url !== '/' && request.url !== '/health') {
        response.writeHead(404);
        response.end();
        return;
    }

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ status: 'ok' }));
});

async function receiveNotification(request, response) {
    const expected = Buffer.from(`Bearer ${WS_SECRET}`);
    const supplied = Buffer.from(request.headers.authorization ?? '');

    if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
        response.writeHead(403);
        response.end();
        return;
    }

    try {
        let body = '';
        for await (const chunk of request) {
            body += chunk;
            if (body.length > 1024) throw new Error('Notification too large');
        }

        const { type, slug } = JSON.parse(body);

        if ((type !== 'mode' && type !== 'deleted') || typeof slug !== 'string') throw new Error('Invalid notification');

        closeAffectedConnections(type === 'deleted', slug);
        response.writeHead(204);
    } catch {
        response.writeHead(400);
    }

    response.end();
}

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

        const rules = await addressRules(tokenResult.documentId);

        if (rules === null) {
            releaseConnection(ip);
            reservedIp = null;
            rejectUpgrade(socket, 404, 'Not Found');
            return;
        }

        const { slug, root, readonly, visitorPasswordHash, ownerSessionId } = rules;

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

async function addressRules(documentId) {
    let document;

    try {
        document = await tablesDB.getRow({
            databaseId: DATABASE_ID,
            tableId: DOCUMENTS_TABLE,
            rowId: documentId,
            queries: [Query.select(['slug'])],
        });
    } catch (error) {
        if (error?.code === 404) return null;
        throw error;
    }

    const root = document.slug.split('/')[0];
    const { rows } = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: DOCUMENTS_TABLE,
        queries: [
            Query.equal('slug', [root]),
            Query.greaterThan('reservedUntil', new Date().toISOString()),
            Query.select(['readonly', 'visitorPasswordHash', 'ownerSessionId']),
            Query.limit(1),
        ],
        total: false,
    });
    const owner = rows[0];

    return {
        slug: document.slug,
        root,
        readonly: owner?.readonly === true,
        visitorPasswordHash: owner?.visitorPasswordHash ?? null,
        ownerSessionId: owner?.ownerSessionId ?? null,
    };
}

function closeAffectedConnections(deleted, slug) {
    for (const [ws, connection] of connections) {
        const affected = deleted
            ? connection.slug === slug || connection.slug.startsWith(`${slug}/`)
            : connection.root === slug;

        if (!affected) continue;

        if (deleted) {
            docs.get(connection.room)?.destroy();
            docs.delete(connection.room);
        }

        ws.close(deleted ? DELETED_CODE : MODE_CHANGED_CODE, deleted ? 'Page deleted' : 'Mode changed');
    }
}

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
    log('info', 'Yjs server shutting down', { signal });
    server.close();
    wss.close();

    await Promise.allSettled(
        Array.from(docs.entries()).map(([room, document]) => persistence.writeState(room, document)),
    );
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

function requiredEnvironment(name) {
    const value = process.env[name];

    if (!value) throw new Error(`${name} is required`);

    return value;
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
