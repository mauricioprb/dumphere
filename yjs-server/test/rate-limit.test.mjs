import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import test from 'node:test';
import { createMessageRateLimiter, guardMessageHandlers } from '../rate-limit.mjs';

test('refills message capacity continuously', () => {
    let time = 1000;
    const consume = createMessageRateLimiter(2, () => time);

    assert.equal(consume(), true);
    assert.equal(consume(), true);
    assert.equal(consume(), false);

    time = 1500;
    assert.equal(consume(), true);
    assert.equal(consume(), false);
});

test('allows short collaboration bursts without raising the sustained rate', () => {
    let time = 1000;
    const consume = createMessageRateLimiter(2, () => time, 4);

    assert.equal(consume(), true);
    assert.equal(consume(), true);
    assert.equal(consume(), true);
    assert.equal(consume(), true);
    assert.equal(consume(), false);

    time = 1500;
    assert.equal(consume(), true);
    assert.equal(consume(), false);
});

test('blocks an excessive message before the collaboration handler runs', () => {
    class FakeWebSocket extends EventEmitter {
        close(code, reason) {
            this.closed = { code, reason };
        }
    }

    const webSocket = new FakeWebSocket();
    const restore = guardMessageHandlers(webSocket, createMessageRateLimiter(1));
    let handled = 0;

    webSocket.on('message', () => handled++);
    restore();
    webSocket.emit('message', Buffer.from([1]));
    webSocket.emit('message', Buffer.from([2]));

    assert.equal(handled, 1);
    assert.deepEqual(webSocket.closed, {
        code: 1008,
        reason: 'Message rate exceeded',
    });
});
