import type { Editor } from '@tiptap/vue-3';

export function getPersistableHtml(editor: Pick<Editor, 'isEmpty' | 'getHTML'>): string {
    return editor.isEmpty ? '' : editor.getHTML();
}
