import { describe, expect, it } from 'vitest';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const attemptedProtocols: (string[] | undefined)[] = [];

class RecordingWebSocket {
    static readonly CONNECTING = 0;

    binaryType = 'arraybuffer';
    readyState = RecordingWebSocket.CONNECTING;
    onmessage: (() => void) | null = null;
    onerror: (() => void) | null = null;
    onclose: (() => void) | null = null;
    onopen: (() => void) | null = null;

    constructor(
        readonly url: string,
        readonly protocols?: string[],
    ) {
        attemptedProtocols.push(protocols);
    }

    send(): void {}

    close(): void {}
}

describe('websocket token refresh', () => {
    it('sends the current protocols on every connection attempt', () => {
        const doc = new Y.Doc();
        const provider = new WebsocketProvider('ws://localhost:1234', 'document-test', doc, {
            connect: false,
            disableBc: true,
            WebSocketPolyfill: RecordingWebSocket as unknown as typeof WebSocket,
            protocols: ['yjs', 'auth.stale-token'],
        });

        provider.connect();
        expect(attemptedProtocols.at(-1)).toEqual(['yjs', 'auth.stale-token']);

        provider.disconnect();
        provider.protocols = ['yjs', 'auth.fresh-token'];
        provider.connect();

        expect(attemptedProtocols.at(-1)).toEqual(['yjs', 'auth.fresh-token']);

        provider.destroy();
        doc.destroy();
    });
});
