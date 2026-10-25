import * as Y from 'yjs';

export function applyBase64YjsState(document: Y.Doc, stateBase64: string | null): boolean {
    if (!stateBase64) return false;

    try {
        const binary = atob(stateBase64);
        const update = Uint8Array.from(binary, (character) => character.charCodeAt(0));

        Y.applyUpdate(document, update, 'server-snapshot');

        return true;
    } catch {
        return false;
    }
}
