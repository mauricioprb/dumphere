import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('editor design system', () => {
    it('shows the correct cursor for enabled and disabled buttons', () => {
        const applicationStyles = readSource('resources/css/app.css');

        expect(applicationStyles).toContain('button:not(:disabled)');
        expect(applicationStyles).toContain('cursor: pointer');
        expect(applicationStyles).toContain('button:disabled');
        expect(applicationStyles).toContain('cursor: not-allowed');
    });

    it('uses the daily palette as semantic workspace tokens', () => {
        const themeStyles = readSource('resources/css/theme.css');

        expect(themeStyles).toContain('--daily-hue: 87deg');
        expect(themeStyles).toContain('--workspace-paper: oklch(0.982 0.008 var(--daily-hue))');
        expect(themeStyles).toContain('--workspace-ink: oklch(0.205 0.018 var(--daily-hue))');
        expect(themeStyles).toContain('--workspace-accent: oklch(0.9 0.055 var(--daily-hue))');
        expect(themeStyles).toContain('--workspace-live: oklch(0.44 0.13 var(--daily-hue))');
        expect(themeStyles).toContain('.dark {');
        expect(themeStyles).toContain('--workspace-paper: oklch(0.19 0.012 var(--daily-hue))');
    });

    it('keeps the writing canvas readable without the oversized focus frame', () => {
        const editorStyles = readSource('resources/css/editor.css');

        expect(editorStyles).toContain('max-width: 76ch');
        expect(editorStyles).toContain('.editor-canvas:focus-within');
        expect(editorStyles).toContain('box-shadow: inset 0 2px 0 var(--workspace-live)');
        expect(editorStyles).toContain('border-inline-start: 1px solid var(--editor-blockquote-border)');
        expect(editorStyles).not.toContain('border-left: 3px solid var(--editor-blockquote-border)');
    });

    it('keeps auxiliary surfaces flat without glow effects', () => {
        const editorStyles = readSource('resources/css/editor.css');

        expect(editorStyles).not.toContain('.editor-dialog input:focus-visible');
        expect(editorStyles).not.toContain('box-shadow: 0 14px 32px');
        expect(editorStyles).not.toContain('box-shadow: 0 10px 24px');
        expect(editorStyles).toContain('.editor-field:focus');
        expect(editorStyles).toContain('border-color: var(--workspace-live)');
    });

    it('preserves the editor tools while applying the shared visual language', () => {
        const page = readSource('resources/js/Pages/Document/Show.vue');
        const editor = readSource('resources/js/Components/Editor/TiptapEditor.vue');
        const toolbar = readSource('resources/js/Components/Editor/EditorToolbar.vue');

        expect(page).toContain('<Wordmark />');
        expect(page).toContain('<ConnectionStatus />');
        expect(page).toContain('<ThemeToggle />');
        expect(editor).toContain('<TableFloatingToolbar :editor="editor" />');
        expect(editor).toContain('<InlineMarkdownEdit ref="inlineEditRef" />');
        expect(editor).toContain('@click="exportMarkdown"');
        expect(editor).toContain('@click="exportHtml"');
        expect(toolbar).toContain("createAction(ImageIcon, 'toolbar.image', insertImage)");
        expect(toolbar).toContain("createAction(Table, 'toolbar.table'");
        expect(toolbar).toContain('editor-tool--active');
        expect(toolbar).not.toContain('bg-primary-100');
    });

    it('aligns the navigation and desktop toolbar at the viewport edges', () => {
        const page = readSource('resources/js/Pages/Document/Show.vue');
        const toolbar = readSource('resources/js/Components/Editor/EditorToolbar.vue');
        const headerMarkup = page.slice(page.indexOf('<header'), page.indexOf('</header>'));
        const sharedEdgePadding = 'px-[clamp(0.75rem,2vw,1.5rem)]';

        expect(headerMarkup).toContain(sharedEdgePadding);
        expect(toolbar).toContain(sharedEdgePadding);
        expect(headerMarkup).not.toContain('max-w-[96rem]');
        expect(headerMarkup).not.toContain('mx-auto');
    });
});
