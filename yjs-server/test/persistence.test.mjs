import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { createPersistence, documentIdFromRoom } from '../persistence.mjs';

const require = createRequire(import.meta.url);
const Y = require('yjs');

const documentId = '6a1f0c2b3d4e5f607182';
const room = `document-${documentId}`;

test('loads and writes Yjs snapshots through the store', async () => {
    const source = new Y.Doc();
    source.getText('content').insert(0, 'persisted');
    const storedState = Buffer.from(Y.encodeStateAsUpdate(source)).toString('base64');
    const saves = [];
    const store = {
        async load() {
            return storedState;
        },
        async save(id, state) {
            saves.push({ id, state });

            return true;
        },
    };
    const persistence = createPersistence(store, { debounceMs: 60_000 });
    const target = new Y.Doc();

    await persistence.bindState(room, target);
    assert.equal(target.getText('content').toString(), 'persisted');

    target.getText('content').insert(9, ' state');
    await persistence.writeState(room, target);

    assert.equal(saves.at(-1).id, documentId);

    const restored = new Y.Doc();
    Y.applyUpdate(restored, Buffer.from(saves.at(-1).state, 'base64'));
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
    const store = {
        async load() {
            return storedState;
        },
        async save() {
            return true;
        },
    };
    const persistence = createPersistence(store, { debounceMs: 60_000 });
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
    const store = {
        async load() {
            return null;
        },
        async save() {
            updateQueries++;

            return true;
        },
    };
    const persistence = createPersistence(store, {
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
    const store = {
        async load() {
            return null;
        },
        async save() {
            updateQueries++;

            return true;
        },
    };
    const persistence = createPersistence(store, {
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
