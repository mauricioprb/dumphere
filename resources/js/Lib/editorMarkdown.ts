import type { Editor } from '@tiptap/vue-3';
import type { Node } from '@tiptap/pm/model';
import type { MarkdownStorage } from 'tiptap-markdown';

interface MarkdownRuntimeStorage extends MarkdownStorage {
    parser: {
        parse(content: string): string;
    };
    serializer: {
        serialize(content: Node): string;
    };
}

export function getMarkdownStorage(editor: Editor | undefined): MarkdownRuntimeStorage | null {
    if (!editor) return null;

    const storage = editor.storage as typeof editor.storage & {
        markdown?: MarkdownRuntimeStorage;
    };

    return storage.markdown ?? null;
}

export function setMarkdownContent(editor: Pick<Editor, 'commands'>, markdown: string, emitUpdate: boolean): boolean {
    return editor.commands.setContent(markdown, { emitUpdate });
}
