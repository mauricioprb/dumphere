import type { XmlFragment } from 'yjs';
import type { WebsocketProvider } from 'y-websocket';
import type { TranslationFunction } from '@/Composables/useI18n';
import type { Doc } from 'yjs';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import { CollaborationCaret } from '@tiptap/extension-collaboration-caret';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import CharacterCount from '@tiptap/extension-character-count';
import Image from '@tiptap/extension-image';
import { common, createLowlight } from 'lowlight';
import { Markdown } from 'tiptap-markdown';
import { collaboratorInkColor } from '@/Lib/collaboratorIdentity';
import { CustomCodeBlock } from '@/Extensions/CustomCodeBlock';
import { EmojiPlugin } from '@/Extensions/EmojiPlugin';
import { SlashCommands } from '@/Extensions/SlashCommands';

interface EditorExtensionsOptions {
    document: Doc;
    fragment: XmlFragment;
    provider: WebsocketProvider;
    user: {
        name: string;
        color: string;
    };
    t: TranslationFunction;
}

const lowlight = createLowlight(common);

export const MAX_DOCUMENT_CHARACTERS = 100_000;

export function createEditorExtensions(options: EditorExtensionsOptions) {
    return [
        StarterKit.configure({
            undoRedo: false,
            codeBlock: false,
        }),
        CustomCodeBlock.configure({
            lowlight,
            defaultLanguage: 'plaintext',
        }),
        Placeholder.configure({
            placeholder: () => options.t('editor.placeholder'),
            showOnlyWhenEditable: true,
            showOnlyCurrent: true,
        }),
        Collaboration.configure({
            document: options.document,
            fragment: options.fragment,
        }),
        CollaborationCaret.configure({
            provider: options.provider,
            user: options.user,
            render: renderCollaborationCaret,
        }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Highlight.configure({ multicolor: false }),
        Typography,
        Superscript,
        Subscript,
        Table.configure({ resizable: true }),
        TableRow,
        TableCell,
        TableHeader,
        CharacterCount.configure({ limit: MAX_DOCUMENT_CHARACTERS }),
        Image.configure({
            inline: false,
            allowBase64: false,
        }),
        Markdown.configure({
            html: false,
            tightLists: true,
            tightListClass: 'tight',
            bulletListMarker: '-',
            linkify: true,
            breaks: false,
            transformPastedText: true,
            transformCopiedText: true,
        }),
        SlashCommands,
        EmojiPlugin,
    ];
}

function renderCollaborationCaret(user: { name?: string; color?: string }): HTMLElement {
    const color = user.color ?? '#B0BEC5';
    const cursor = document.createElement('span');
    const label = document.createElement('span');

    cursor.classList.add('collaboration-carets__caret');
    cursor.style.setProperty('--collaboration-color', color);
    cursor.style.setProperty('--collaboration-ink', collaboratorInkColor(color));

    label.classList.add('collaboration-carets__label');
    label.textContent = user.name ?? 'Anonymous';
    cursor.append(label);

    return cursor;
}
