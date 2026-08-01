import { describe, expect, it } from 'vitest';
import { buildWebSocketUrl } from '../../resources/js/Lib/websocketUrl';

describe('buildWebSocketUrl', () => {
    it('uses the local development server on localhost', () => {
        expect(
            buildWebSocketUrl(
                {},
                {
                    hostname: 'localhost',
                    protocol: 'http:',
                },
            ),
        ).toBe('ws://localhost:1234');
    });

    it('uses the same-origin secure proxy in production by default', () => {
        expect(
            buildWebSocketUrl(
                {
                    host: '',
                    port: '',
                    scheme: '',
                    path: '',
                },
                {
                    hostname: 'editor.example',
                    protocol: 'https:',
                },
            ),
        ).toBe('wss://editor.example/yjs-ws');
    });

    it('honors an explicit WebSocket endpoint', () => {
        expect(
            buildWebSocketUrl(
                {
                    host: 'collaboration.example',
                    port: '443',
                    scheme: 'wss',
                    path: '/socket/',
                },
                {
                    hostname: 'editor.example',
                    protocol: 'https:',
                },
            ),
        ).toBe('wss://collaboration.example/socket');
    });
});
