import { describe, expect, it, vi } from 'vitest';
import type { Editor } from '@tiptap/vue-3';
import { setMarkdownContent } from '../../resources/js/Lib/editorMarkdown';

describe('Markdown editor content', () => {
    it('passes raw Markdown to the extension command for a single parse', () => {
        const setContent = vi.fn(() => true);
        const editor = {
            commands: { setContent },
        } as unknown as Pick<Editor, 'commands'>;
        const markdown = 'A paragraph with **emphasis**.';

        const applied = setMarkdownContent(editor, markdown, false);

        expect(applied).toBe(true);
        expect(setContent).toHaveBeenCalledOnce();
        expect(setContent).toHaveBeenCalledWith(markdown, { emitUpdate: false });
    });

    it('does not accumulate paragraph tags across repeated autosave synchronization', () => {
        const receivedContent: string[] = [];
        const editor = {
            commands: {
                setContent: (content: string) => {
                    receivedContent.push(content);
                    return true;
                },
            },
        } as unknown as Pick<Editor, 'commands'>;
        const markdown = 'Stable paragraph';

        setMarkdownContent(editor, markdown, false);
        setMarkdownContent(editor, markdown, false);
        setMarkdownContent(editor, markdown, false);

        expect(receivedContent).toEqual([markdown, markdown, markdown]);
        expect(receivedContent).not.toContain('<p>Stable paragraph</p>');
    });
});
