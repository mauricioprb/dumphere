import { ref, watch, onUnmounted, type Ref } from 'vue';
import { router } from '@inertiajs/vue3';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';
import { useDocumentStore } from '@/Stores/documentStore';
import { applyBase64YjsState } from '@/Lib/yjsState';
import { buildWebSocketUrl } from '@/Lib/websocketUrl';
import { generateUniqueCollaboratorName, randomCollaboratorColor } from '@/Lib/collaboratorIdentity';

interface YjsProviderOptions {
    documentId: string;
    wsToken: Ref<string>;
    initialStateBase64: string | null;
}

const RECONNECT_FAILURES_BEFORE_TOKEN_REFRESH = 2;

interface AwarenessState {
    user?: {
        name?: unknown;
        color?: unknown;
    };
}

export function useYjsProvider({ documentId, wsToken, initialStateBase64 }: YjsProviderOptions) {
    const store = useDocumentStore();
    const ydoc = new Y.Doc();
    const yXmlFragment = ydoc.getXmlFragment('document');
    const wsUrl = buildWebSocketUrl({
        host: import.meta.env.VITE_YJS_WS_HOST,
        port: import.meta.env.VITE_YJS_WS_PORT,
        scheme: import.meta.env.VITE_YJS_WS_SCHEME,
        path: import.meta.env.VITE_YJS_WS_PATH,
    });

    applyBase64YjsState(ydoc, initialStateBase64);

    const indexeddbPersistence = new IndexeddbPersistence(`md-editor-${documentId}`, ydoc);
    const wsProvider = new WebsocketProvider(wsUrl, `document-${documentId}`, ydoc, {
        connect: false,
        maxBackoffTime: 10000,
        protocols: authProtocols(wsToken.value),
    });

    watch(wsToken, (freshToken) => {
        wsProvider.protocols = authProtocols(freshToken);
    });

    let tokenRefreshInFlight = false;

    const refreshExpiredToken = () => {
        if (tokenRefreshInFlight || wsProvider.wsUnsuccessfulReconnects < RECONNECT_FAILURES_BEFORE_TOKEN_REFRESH) {
            return;
        }

        tokenRefreshInFlight = true;
        router.reload({
            only: ['wsToken'],
            onFinish: () => {
                tokenRefreshInFlight = false;
            },
        });
    };

    wsProvider.on('connection-error', refreshExpiredToken);

    const awareness = wsProvider.awareness;
    const userColor = randomCollaboratorColor();
    const userName = getOrCreateUserName();

    awareness.setLocalStateField('user', {
        name: userName,
        color: userColor,
    });

    const isConnected = ref(wsProvider.wsconnected);
    store.setConnected(false);

    wsProvider.on('status', (event: { status: string }) => {
        isConnected.value = event.status === 'connected';
        store.setConnected(event.status === 'connected');
    });

    const handleAwarenessChange = () => {
        const states = awareness.getStates();
        const myState = awareness.getLocalState();

        const localUser = readAwarenessUser(myState);

        if (localUser) {
            const myName = localUser.name;
            let hasCollision = false;

            states.forEach((state, clientId) => {
                if (clientId !== ydoc.clientID && readAwarenessUser(state)?.name === myName) {
                    if (ydoc.clientID > clientId) {
                        hasCollision = true;
                    }
                }
            });

            if (hasCollision) {
                const usedNames = Array.from(states.values())
                    .map((state) => readAwarenessUser(state)?.name)
                    .filter((name): name is string => Boolean(name));

                const newName = generateUniqueCollaboratorName(usedNames);
                localStorage.setItem(USERNAME_STORAGE_KEY, newName);

                awareness.setLocalStateField('user', {
                    ...localUser,
                    name: newName,
                });
                return;
            }
        }

        const users = Array.from(states.entries()).flatMap(([clientId, state]) => {
            if (clientId === ydoc.clientID) return [];

            const user = readAwarenessUser(state);
            return user ? [{ id: String(clientId), ...user }] : [];
        });
        store.setUsers(users);
    };

    awareness.on('change', handleAwarenessChange);

    const whenLocalSynced = new Promise<void>((resolve) => {
        if (indexeddbPersistence.synced) {
            resolve();
        } else {
            indexeddbPersistence.once('synced', () => resolve());
        }
    });

    function connect(): void {
        wsProvider.connect();
    }

    const handleBeforeUnload = () => {
        awareness.setLocalState(null);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    onUnmounted(() => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        wsProvider.off('connection-error', refreshExpiredToken);
        awareness.setLocalState(null);
        awareness.off('change', handleAwarenessChange);
        store.setConnected(false);
        store.setUsers([]);
        wsProvider.disconnect();
        wsProvider.destroy();
        indexeddbPersistence.destroy();
        ydoc.destroy();
    });

    return {
        ydoc,
        yXmlFragment,
        wsProvider,
        userName,
        userColor,
        whenLocalSynced,
        connect,
    };
}

const USERNAME_STORAGE_KEY = 'md-editor-username';

function authProtocols(token: string): string[] {
    return ['yjs', `auth.${token}`];
}

function getOrCreateUserName(): string {
    const stored = localStorage.getItem(USERNAME_STORAGE_KEY);
    if (stored) return stored;

    const name = generateUniqueCollaboratorName([]);
    localStorage.setItem(USERNAME_STORAGE_KEY, name);
    return name;
}

function readAwarenessUser(state: unknown): { name: string; color: string } | null {
    if (!state || typeof state !== 'object') return null;

    const user = (state as AwarenessState).user;
    if (!user || typeof user !== 'object') return null;

    return {
        name: typeof user.name === 'string' && user.name ? user.name : 'Anonymous',
        color: typeof user.color === 'string' && user.color ? user.color : '#888',
    };
}
