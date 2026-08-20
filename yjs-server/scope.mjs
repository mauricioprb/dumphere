import * as decoding from 'lib0/decoding';

const MESSAGE_SYNC = 0;
const SYNC_STEP_2 = 1;
const SYNC_UPDATE = 2;

export function isWriteMessage(payload) {
    try {
        const bytes = payload instanceof Uint8Array ? payload : new Uint8Array(payload);
        const decoder = decoding.createDecoder(bytes);

        if (decoding.readVarUint(decoder) !== MESSAGE_SYNC) return false;

        const step = decoding.readVarUint(decoder);

        return step === SYNC_STEP_2 || step === SYNC_UPDATE;
    } catch {
        return true;
    }
}
