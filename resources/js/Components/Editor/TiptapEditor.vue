<script setup lang="ts">
import { onMounted, onUnmounted, ref, toRef, watch } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import type { Editor } from '@tiptap/core';
import { BubbleMenu } from '@tiptap/vue-3/menus';
import type { EditorView } from '@tiptap/pm/view';
import { useYjsProvider } from '@/Composables/useYjsProvider';
import { useAutoSave } from '@/Composables/useAutoSave';
import { useI18n } from '@/Composables/useI18n';
import { createEditorExtensions } from '@/Extensions/editorExtensions';
import { getMarkdownStorage, setMarkdownContent } from '@/Lib/editorMarkdown';
import EditorToolbar from './EditorToolbar.vue';
import ImageInsertModal from './ImageInsertModal.vue';
import InlineMarkdownEdit from './InlineMarkdownEdit.vue';
import TableFloatingToolbar from './TableFloatingToolbar.vue';
import { useImageModal } from '@/Composables/useImageModal';
import { Download } from '@lucide/vue';

const props = defineProps<{
    documentId: string;
    slug: string;
    initialContent: string;
    initialYjsState: string | null;
    wsToken: string;
}>();

const { t, locale } = useI18n();
const editorReady = ref(false);
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const { ydoc, yXmlFragment, wsProvider, userName, userColor, whenLocalSynced, connect } = useYjsProvider({
    documentId: props.documentId,
    wsToken: toRef(props, 'wsToken'),
    initialStateBase64: props.initialYjsState,
});

function openInlineMarkdownAt(view: EditorView, pos: number): boolean {
    if (sourceMode.value) return false;

    const $pos = view.state.doc.resolve(pos);
    const depth = $pos.depth > 0 ? 1 : 0;
    if (depth === 0) return false;

    const node = $pos.node(depth);
    const skip = ['table', 'codeBlock', 'image', 'horizontalRule'];
    if (skip.includes(node.type.name)) return false;

    const from = $pos.before(depth);
    const to = $pos.after(depth);
    const dom = view.nodeDOM(from);
    if (!(dom instanceof HTMLElement)) return false;

    const markdown = getMarkdownStorage(editor.value);
    if (!markdown) return false;

    const tempDoc = view.state.schema.topNodeType.create(null, node);
    const md = markdown.serializer.serialize(tempDoc).trim();
    const containerEl = view.dom.closest('[data-editor-container]') as HTMLElement | null;
    if (!containerEl) return false;

    inlineEditRef.value?.open(md, dom, containerEl).then((result: string | null) => {
        if (result === null || !editor.value) return;

        const ed = editor.value;
        const markdown = getMarkdownStorage(ed);
        if (!markdown) return;

        ed.chain().focus().insertContentAt({ from, to }, result).run();
    });

    return true;
}

const editor = useEditor({
    editable: false,
    extensions: createEditorExtensions({
        document: ydoc,
        fragment: yXmlFragment,
        provider: wsProvider,
        user: {
            name: userName,
            color: userColor,
        },
        t,
    }),
    editorProps: {
        attributes: {
            class: 'tiptap prose prose-lg max-w-none min-h-full',
            role: 'textbox',
            'aria-multiline': 'true',
            'aria-label': t('editor.visualLabel'),
            'aria-keyshortcuts': 'Alt+Enter',
        },
        handleDoubleClick: (view, pos) => openInlineMarkdownAt(view, pos),
        handleKeyDown: (view, event) => {
            if (event.altKey && event.key === 'Enter') {
                event.preventDefault();
                return openInlineMarkdownAt(view, view.state.selection.from);
            }
            return false;
        },
    },
    onCreate({ editor: ed }) {
        void whenLocalSynced.then(() => {
            if (yXmlFragment.length === 0 && props.initialContent) {
                ed.commands.setContent(props.initialContent, { emitUpdate: false });
            }

            connect();
            ed.setEditable(true);
            editorReady.value = true;
        });
    },
});

const { open: openImageModal } = useImageModal();

function handleSlashImage(e: Event) {
    const detail = (e as CustomEvent).detail;
    openImageModal().then((data) => {
        if (data && detail?.editor) {
            detail.editor.chain().focus().setImage({ src: data.src, alt: data.alt }).run();
        }
    });
}

onMounted(() => window.addEventListener('open-image-modal', handleSlashImage));
onUnmounted(() => window.removeEventListener('open-image-modal', handleSlashImage));

const inlineEditRef = ref<InstanceType<typeof InlineMarkdownEdit> | null>(null);

const characterCount = ref(0);
const wordCount = ref(0);
const sourceMode = ref(false);
const sourceContent = ref('');

function applySourceContent(emitUpdate: boolean) {
    if (!editor.value || !sourceMode.value) return;

    setMarkdownContent(editor.value, sourceContent.value, emitUpdate);
}

function toggleSourceMode() {
    if (!editor.value) return;

    if (!sourceMode.value) {
        sourceContent.value = getMarkdownStorage(editor.value)?.getMarkdown() ?? '';
        sourceMode.value = true;
    } else {
        applySourceContent(true);
        sourceMode.value = false;
    }
}

const { onEditorUpdate } = useAutoSave(editor, props.slug, 1500, () => applySourceContent(false));

watch(
    editor,
    (ed, _old, onCleanup) => {
        if (!ed) return;
        ed.on('update', onEditorUpdate);
        onCleanup(() => ed.off('update', onEditorUpdate));
    },
    { immediate: true },
);

watch(
    () => editor.value?.storage.characterCount,
    (storage) => {
        if (storage) {
            characterCount.value = storage.characters();
            wordCount.value = storage.words();
        }
    },
    { deep: true, flush: 'post' },
);

function downloadFile(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function exportMarkdown() {
    const md = sourceMode.value ? sourceContent.value : (getMarkdownStorage(editor.value)?.getMarkdown() ?? '');
    const filename = props.slug.split('/').pop() ?? 'document';
    downloadFile(md, `${filename}.md`, 'text/markdown;charset=utf-8');
}

function exportHtml() {
    applySourceContent(false);
    const body = editor.value?.getHTML() ?? '';
    const title = props.slug.split('/').pop() ?? 'document';
    const html = `<!DOCTYPE html>\n<html lang="${locale.value}">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${title}</title>\n</head>\n<body>\n${body}\n</body>\n</html>`;
    downloadFile(html, `${title}.html`, 'text/html;charset=utf-8');
}
</script>

<template>
    <div class="editor-workspace flex h-full flex-col">
        <EditorToolbar
            v-if="editor && editorReady"
            :editor="editor"
            :source-mode="sourceMode"
            @toggle-source="toggleSourceMode"
        />
        <ImageInsertModal />

        <div
            v-if="!editorReady"
            class="flex flex-1 items-center justify-center text-sm text-(--workspace-muted)"
            role="status"
            aria-live="polite"
        >
            <span class="inline-flex items-center gap-2">
                <span
                    class="size-3 animate-pulse rounded-full bg-(--workspace-live) motion-reduce:animate-none"
                    aria-hidden="true"
                />
                {{ t('editor.loading') }}
            </span>
        </div>

        <div
            v-show="editorReady && !sourceMode"
            data-editor-container
            class="editor-canvas relative min-h-0 flex-1 overflow-y-auto"
        >
            <EditorContent :editor="editor" class="h-full" />

            <BubbleMenu
                v-if="editor"
                :editor="editor"
                plugin-key="tableMenu"
                :should-show="({ editor: activeEditor }: { editor: Editor }) => activeEditor.isActive('table')"
                :tippy-options="{
                    placement: 'top',
                    duration: prefersReducedMotion ? 0 : [150, 100],
                    animation: prefersReducedMotion ? false : 'fade',
                }"
            >
                <div class="editor-popover px-1.5 py-1.5">
                    <TableFloatingToolbar :editor="editor" />
                </div>
            </BubbleMenu>

            <InlineMarkdownEdit ref="inlineEditRef" />
        </div>

        <div v-show="sourceMode" class="editor-source-canvas min-h-0 flex-1 overflow-y-auto">
            <textarea
                v-model="sourceContent"
                spellcheck="false"
                :aria-label="t('editor.sourceLabel')"
                class="editor-source h-full w-full resize-none font-mono text-base leading-relaxed focus:outline-none sm:text-sm"
                :placeholder="t('editor.sourcePlaceholder')"
                @input="onEditorUpdate"
            />
        </div>

        <div
            v-if="editor && editorReady"
            class="editor-meta flex shrink-0 items-center justify-between border-t border-(--workspace-rule) px-[clamp(0.5rem,2vw,1.25rem)] text-[0.72rem] text-(--workspace-muted)"
        >
            <div class="flex items-center gap-0.5">
                <button
                    type="button"
                    :aria-label="t('export.markdown')"
                    :title="t('export.markdown')"
                    class="editor-meta-action editor-focus flex min-h-11 cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 font-mono transition-colors hover:bg-(--workspace-panel) hover:text-(--workspace-ink) focus:outline-none motion-reduce:transition-none sm:min-h-9"
                    @click="exportMarkdown"
                >
                    <Download class="h-3 w-3" aria-hidden="true" />
                    <span>.md</span>
                </button>
                <button
                    type="button"
                    :aria-label="t('export.html')"
                    :title="t('export.html')"
                    class="editor-meta-action editor-focus flex min-h-11 cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 font-mono transition-colors hover:bg-(--workspace-panel) hover:text-(--workspace-ink) focus:outline-none motion-reduce:transition-none sm:min-h-9"
                    @click="exportHtml"
                >
                    <Download class="h-3 w-3" aria-hidden="true" />
                    <span>.html</span>
                </button>
            </div>
            <div class="flex items-center gap-3 font-mono tabular-nums">
                <span>{{ t('editor.wordCount', { count: wordCount }) }}</span>
                <span>{{ t('editor.characterCount', { count: characterCount }) }}</span>
            </div>
        </div>
    </div>
</template>
