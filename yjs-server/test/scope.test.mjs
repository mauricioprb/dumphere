import assert from 'node:assert/strict';
import test from 'node:test';
import * as encoding from 'lib0/encoding';
import { isWriteMessage } from '../scope.mjs';

function syncMessage(step) {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, 0);
    encoding.writeVarUint(encoder, step);
    encoding.writeVarUint(encoder, 0);

    return encoding.toUint8Array(encoder);
}

function awarenessMessage() {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, 1);
    encoding.writeVarUint(encoder, 0);

    return encoding.toUint8Array(encoder);
}

test('lets a reader ask for state and announce its cursor', () => {
    assert.equal(isWriteMessage(syncMessage(0)), false);
    assert.equal(isWriteMessage(awarenessMessage()), false);
});

test('blocks anything that would change the document', () => {
    assert.equal(isWriteMessage(syncMessage(1)), true);
    assert.equal(isWriteMessage(syncMessage(2)), true);
    assert.equal(isWriteMessage(new Uint8Array([255, 255, 255])), true);
});
