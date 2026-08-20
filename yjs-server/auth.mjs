import crypto from 'node:crypto';
import { isIP } from 'node:net';

const DOCUMENT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const BASE64_URL_PATTERN = /^[A-Za-z0-9_-]+$/;
const MAX_TOKEN_LIFETIME_SECONDS = 7200;
const SCOPES = new Set(['write', 'read']);
const GATE_PATTERN = /^[0-9a-f]{0,12}$/;

export function roomForDocument(documentId) {
    if (!DOCUMENT_ID_PATTERN.test(documentId)) {
        throw new Error('Invalid document identifier');
    }

    return `document-${documentId.toLowerCase()}`;
}

export function roomFromPathname(pathname) {
    try {
        const room = decodeURIComponent(pathname).replace(/^\/+|\/+$/g, '');

        return /^document-[0-9a-f-]{36}$/i.test(room) && !room.includes('/') ? room.toLowerCase() : null;
    } catch {
        return null;
    }
}

export function gateFor(readonly, visitorPasswordHash, ownerSessionId) {
    return crypto
        .createHash('sha256')
        .update(`${readonly ? '1' : '0'}:${visitorPasswordHash ?? ''}:${ownerSessionId ?? ''}`)
        .digest('hex')
        .slice(0, 12);
}

export function verifyToken(token, secret, now = Math.floor(Date.now() / 1000)) {
    if (!secret || !token || !BASE64_URL_PATTERN.test(token)) {
        return { valid: false, reason: 'malformed' };
    }

    try {
        const decoded = Buffer.from(token, 'base64url').toString('utf8');
        const parts = decoded.split(':');

        if (parts.length !== 5) return { valid: false, reason: 'malformed' };

        const [documentId, scope, gate, expiresAtValue, signature] = parts;
        const expiresAt = Number(expiresAtValue);

        if (
            !DOCUMENT_ID_PATTERN.test(documentId) ||
            !SCOPES.has(scope) ||
            !GATE_PATTERN.test(gate) ||
            !Number.isSafeInteger(expiresAt)
        ) {
            return { valid: false, reason: 'malformed' };
        }

        if (expiresAt < now) {
            return { valid: false, reason: 'expired' };
        }

        if (expiresAt > now + MAX_TOKEN_LIFETIME_SECONDS) {
            return { valid: false, reason: 'invalid_lifetime' };
        }

        const secretBytes = secret.startsWith('base64:') ? Buffer.from(secret.slice(7), 'base64') : Buffer.from(secret);
        const expected = crypto
            .createHmac('sha256', secretBytes)
            .update(`${documentId}:${scope}:${gate}:${expiresAt}`)
            .digest('hex');
        const supplied = Buffer.from(signature);
        const expectedBytes = Buffer.from(expected);

        if (supplied.length !== expectedBytes.length || !crypto.timingSafeEqual(expectedBytes, supplied)) {
            return { valid: false, reason: 'bad_signature' };
        }

        return {
            valid: true,
            scope,
            gate,
            documentId: documentId.toLowerCase(),
            room: roomForDocument(documentId),
        };
    } catch {
        return { valid: false, reason: 'malformed' };
    }
}

export function tokenFromProtocols(protocolHeader) {
    if (typeof protocolHeader !== 'string') return null;

    const protocol = protocolHeader
        .split(',')
        .map((value) => value.trim())
        .find((value) => value.startsWith('auth.'));

    return protocol?.slice('auth.'.length) || null;
}

export function isAllowedOrigin(origin, allowedOrigins) {
    if (typeof origin !== 'string' || origin.length === 0) return false;

    return allowedOrigins.has(origin);
}

export function resolveClientIp(forwardedHeader, remoteAddress, trustProxy, trustedProxies) {
    const fallback = typeof remoteAddress === 'string' && remoteAddress !== '' ? remoteAddress : 'unknown';

    if (!trustProxy || !isTrustedProxy(fallback, trustedProxies)) {
        return fallback;
    }

    if (typeof forwardedHeader !== 'string') {
        return fallback;
    }

    const forwardedIp = forwardedHeader.split(',')[0].trim();

    return isIP(forwardedIp) === 0 ? fallback : forwardedIp;
}

function isTrustedProxy(remoteAddress, trustedProxies) {
    if (!(trustedProxies instanceof Set)) return false;
    if (trustedProxies.has(remoteAddress)) return true;

    return remoteAddress.startsWith('::ffff:') && trustedProxies.has(remoteAddress.slice('::ffff:'.length));
}
