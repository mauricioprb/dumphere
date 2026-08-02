import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { createPostgresPersistence, documentIdFromRoom } from '../persistence.mjs';

const require = createRequire(import.meta.url);
const Y = require('yjs');

const documentId = '0198f37a-21b4-7d6c-8a9b-123456789abc';
const room = `document-${documentId}`;

test('loads and writes Yjs snapshots through PostgreSQL', async () => {
    const source = new Y.Doc();
    source.getText('content').insert(0, 'persisted');
    const storedState = Buffer.from(Y.encodeStateAsUpdate(source)).toString('base64');
    const queries = [];
    const pool = {
        async query(sql, parameters) {
            queries.push({ sql, parameters });

            if (sql.startsWith('SELECT yjs_state_base64')) {
                return { rowCount: 1, rows: [{ yjs_state_base64: storedState }] };
            }

            return { rowCount: 1, rows: [] };
        },
    };
    const persistence = createPostgresPersistence(pool, { debounceMs: 60_000 });
    const target = new Y.Doc();

    await persistence.bindState(room, target);
    assert.equal(target.getText('content').toString(), 'persisted');

    target.getText('content').insert(9, ' state');
    await persistence.writeState(room, target);

    const update = queries.find((query) => query.sql.startsWith('UPDATE documents'));
    assert.equal(update.parameters[1], documentId);

    const restored = new Y.Doc();
    Y.applyUpdate(restored, Buffer.from(update.parameters[0], 'base64'));
    assert.equal(restored.getText('content').toString(), 'persisted state');
});

test('restores Tiptap XML with the same Yjs constructors used by the websocket server', async () => {
    const source = new Y.Doc();
    const paragraph = new Y.XmlElement('paragraph');
    const text = new Y.XmlText();
    text.insert(0, 'persisted');
    paragraph.insert(0, [text]);
    source.getXmlFragment('document').insert(0, [paragraph]);

    const storedState = Buffer.from(Y.encodeStateAsUpdate(source)).toString('base64');
    const pool = {
        async query(sql) {
            if (sql.startsWith('SELECT yjs_state_base64')) {
                return { rowCount: 1, rows: [{ yjs_state_base64: storedState }] };
            }

            return { rowCount: 1, rows: [] };
        },
    };
    const persistence = createPostgresPersistence(pool, { debounceMs: 60_000 });
    const target = new Y.Doc();
    const fragment = target.getXmlFragment('document');

    await persistence.bindState(room, target);

    assert.ok(fragment.get(0) instanceof Y.XmlElement);
    assert.ok(fragment.get(0).get(0) instanceof Y.XmlText);
    assert.equal(fragment.toString(), '<paragraph>persisted</paragraph>');
});

test('extracts a document UUID only from a canonical room', () => {
    assert.equal(documentIdFromRoom(room), documentId);
    assert.equal(documentIdFromRoom(`other-${documentId}`), null);
});

test('does not persist a collaboration snapshot above the document limit', async () => {
    let updateQueries = 0;
    let oversizedState = null;
    const pool = {
        async query(sql) {
            if (sql.startsWith('UPDATE documents')) updateQueries++;

            return { rowCount: 1, rows: [] };
        },
    };
    const persistence = createPostgresPersistence(pool, {
        maxStateBytes: 10,
        onStateTooLarge(_room, sizeBytes) {
            oversizedState = sizeBytes;
        },
    });
    const document = new Y.Doc();
    document.getText('content').insert(0, 'content larger than ten bytes');

    await persistence.writeState(room, document);

    assert.equal(updateQueries, 0);
    assert.ok(oversizedState > 10);
});

test('enforces the document limit immediately while updates are still arriving', async () => {
    let oversizedState = null;
    let updateQueries = 0;
    const pool = {
        async query(sql) {
            if (sql.startsWith('UPDATE documents')) updateQueries++;

            return { rowCount: 1, rows: [] };
        },
    };
    const persistence = createPostgresPersistence(pool, {
        debounceMs: 60_000,
        maxStateBytes: 64,
        onStateTooLarge(_room, sizeBytes) {
            oversizedState = sizeBytes;
        },
    });
    const document = new Y.Doc();

    await persistence.bindState(room, document);
    document.getText('content').insert(0, 'x'.repeat(1_000));

    assert.ok(oversizedState > 64);
    assert.equal(updateQueries, 0);
});
