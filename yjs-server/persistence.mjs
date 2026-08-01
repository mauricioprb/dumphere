import * as Y from 'yjs';

const ROOM_PATTERN = /^document-([0-9a-f-]{36})$/i;

export function documentIdFromRoom(room) {
    const match = ROOM_PATTERN.exec(room);

    return match?.[1]?.toLowerCase() ?? null;
}

export function createPostgresPersistence(
    pool,
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

        const stateBase64 = Buffer.from(state).toString('base64');
        const result = await pool.query(
            'UPDATE documents SET yjs_state_base64 = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [stateBase64, documentId],
        );

        if (result.rowCount === 0) {
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
        provider: pool,

        async bindState(docName, ydoc) {
            const documentId = documentIdFromRoom(docName);
            if (!documentId) throw new Error('Invalid document room');

            ydoc.on('update', () => {
                if (encodeStateWithinLimit(docName, ydoc) !== null) {
                    schedulePersist(docName, ydoc);
                }
            });

            try {
                const result = await pool.query('SELECT yjs_state_base64 FROM documents WHERE id = $1 LIMIT 1', [
                    documentId,
                ]);
                const stateBase64 = result.rows[0]?.yjs_state_base64;

                if (typeof stateBase64 === 'string' && stateBase64.length > 0) {
                    Y.applyUpdate(ydoc, Buffer.from(stateBase64, 'base64'), 'postgres');
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
