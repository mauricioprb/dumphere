import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import test from 'node:test';
import {
    isAllowedOrigin,
    resolveClientIp,
    roomForDocument,
    roomFromPathname,
    tokenFromProtocols,
    verifyToken,
} from '../auth.mjs';

const secret = 'test-secret';
const documentId = '0198f37a-21b4-7d6c-8a9b-123456789abc';
const now = 1_800_000_000;

function tokenFor(id = documentId, expiresAt = now + 3600, signingSecret = secret) {
    const signature = crypto.createHmac('sha256', signingSecret).update(`${id}:${expiresAt}`).digest('hex');

    return Buffer.from(`${id}:${expiresAt}:${signature}`).toString('base64url');
}

test('accepts a valid token only for its document room', () => {
    const result = verifyToken(tokenFor(), secret, now);

    assert.equal(result.valid, true);
    assert.equal(result.room, roomForDocument(documentId));
    assert.notEqual(result.room, roomForDocument('0198f37a-21b4-7d6c-8a9b-000000000000'));
});

test('rejects expired, overlong and tampered tokens', () => {
    assert.equal(verifyToken(tokenFor(documentId, now - 1), secret, now).reason, 'expired');
    assert.equal(verifyToken(tokenFor(documentId, now + 7201), secret, now).reason, 'invalid_lifetime');
    assert.equal(verifyToken(tokenFor(documentId, now + 3600, 'wrong-secret'), secret, now).reason, 'bad_signature');
    assert.equal(verifyToken('not-base64!', secret, now).reason, 'malformed');
});

test('parses only canonical document rooms', () => {
    assert.equal(roomFromPathname(`/document-${documentId}`), `document-${documentId}`);
    assert.equal(roomFromPathname(`/other-${documentId}`), null);
    assert.equal(roomFromPathname(`/document-${documentId}/extra`), null);
});

test('requires an explicitly allowed browser origin', () => {
    const allowed = new Set(['https://editor.example']);

    assert.equal(isAllowedOrigin('https://editor.example', allowed), true);
    assert.equal(isAllowedOrigin('https://evil.example', allowed), false);
    assert.equal(isAllowedOrigin(undefined, allowed), false);
});

test('extracts credentials from a WebSocket subprotocol instead of the URL', () => {
    const token = tokenFor();

    assert.equal(tokenFromProtocols(`yjs, auth.${token}`), token);
    assert.equal(tokenFromProtocols('yjs'), null);
    assert.equal(tokenFromProtocols(undefined), null);
});

test('trusts forwarded IPs only from explicitly trusted proxies', () => {
    const trusted = new Set(['127.0.0.1']);

    assert.equal(resolveClientIp('203.0.113.10', '127.0.0.1', true, trusted), '203.0.113.10');
    assert.equal(resolveClientIp('203.0.113.10', '::ffff:127.0.0.1', true, trusted), '203.0.113.10');
    assert.equal(resolveClientIp('203.0.113.10', '198.51.100.20', true, trusted), '198.51.100.20');
    assert.equal(resolveClientIp('not-an-ip', '127.0.0.1', true, trusted), '127.0.0.1');
    assert.equal(resolveClientIp('203.0.113.10', '127.0.0.1', false, trusted), '127.0.0.1');
});
