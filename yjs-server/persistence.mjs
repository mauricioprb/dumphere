import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Y = require('yjs');

const ROOM_PATTERN = /^document-([A-Za-z0-9][A-Za-z0-9._-]{0,35})$/;

export function documentIdFromRoom(room) {
    const match = ROOM_PATTERN.exec(room);

    return match?.[1] ?? null;
}

export function createPersistence(
    store,
    { debounceMs = 750, logger = console, maxStateBytes = 2_097_152, onStateTooLarge = () => {} } = {},
) {
    const pendingWrites = new Map();
    const rejectedDocuments = new WeakSet();

    function encodeStateWithinLimit(docName, ydoc) {
        if (rejectedDocuments.has(ydoc)) return null;

        const state = Y.encodeStateAsUpdate(ydoc);

        if (state.byteLength > maxStateBytes) {
            const pending = pendingWrites.get(docName);
            if (pending) clearTimeout(pending);
            pendingWrites.delete(docName);
            rejectedDocuments.add(ydoc);
            onStateTooLarge(docName, state.byteLength);

            return null;
        }

        return state;
    }

    async function persist(docName, ydoc) {
        const documentId = documentIdFromRoom(docName);
        if (!documentId) return;

        const state = encodeStateWithinLimit(docName, ydoc);
        if (state === null) return;

        const saved = await store.save(documentId, Buffer.from(state).toString('base64'));

        if (!saved) {
            logger.warn('Yjs snapshot was not persisted because the document no longer exists', {
                documentId,
            });
        }
    }

    function schedulePersist(docName, ydoc, delayMs = debounceMs) {
        const existing = pendingWrites.get(docName);
        if (existing) clearTimeout(existing);

        const timer = setTimeout(() => {
            pendingWrites.delete(docName);
            void persist(docName, ydoc).catch((error) => {
                logger.error('Failed to persist Yjs snapshot', {
                    documentId: documentIdFromRoom(docName),
                    error: error.message,
                });
                schedulePersist(docName, ydoc, 5000);
            });
        }, delayMs);

        timer.unref?.();
        pendingWrites.set(docName, timer);
    }

    return {

        async bindState(docName, ydoc) {
            const documentId = documentIdFromRoom(docName);
            if (!documentId) throw new Error('Invalid document room');

            ydoc.on('update', () => {
                if (encodeStateWithinLimit(docName, ydoc) !== null) {
                    schedulePersist(docName, ydoc);
                }
            });

            try {
                const stateBase64 = await store.load(documentId);

                if (typeof stateBase64 === 'string' && stateBase64.length > 0) {
                    Y.applyUpdate(ydoc, Buffer.from(stateBase64, 'base64'), 'appwrite');
                }
            } catch (error) {
                logger.error('Failed to load Yjs snapshot', {
                    documentId,
                    error: error.message,
                });
            }
        },

        async writeState(docName, ydoc) {
            const existing = pendingWrites.get(docName);
            if (existing) {
                clearTimeout(existing);
                pendingWrites.delete(docName);
            }

            try {
                await persist(docName, ydoc);
            } catch (error) {
                logger.error('Failed to write final Yjs snapshot', {
                    documentId: documentIdFromRoom(docName),
                    error: error.message,
                });
                schedulePersist(docName, ydoc, 5000);
            }
        },
    };
}
