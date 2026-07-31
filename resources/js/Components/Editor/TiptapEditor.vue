<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import { BubbleMenu } from '@tiptap/vue-3/menus'
import StarterKit from '@tiptap/starter-kit'
import { common, createLowlight } from 'lowlight'
import { CustomCodeBlock } from '@/Extensions/CustomCodeBlock'
import Collaboration from '@tiptap/extension-collaboration'
import { CollaborationCaret } from '@tiptap/extension-collaboration-caret'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'
import CharacterCount from '@tiptap/extension-character-count'
import Image from '@tiptap/extension-image'
import { Markdown } from 'tiptap-markdown'
import { SlashCommands } from '@/Extensions/SlashCommands'
import { EmojiPlugin } from '@/Extensions/EmojiPlugin'

const lowlight = createLowlight(common)
import { useYjsProvider } from '@/Composables/useYjsProvider'
import { useAutoSave } from '@/Composables/useAutoSave'
import { useI18n } from '@/Composables/useI18n'
import EditorToolbar from './EditorToolbar.vue'
import ImageInsertModal from './ImageInsertModal.vue'
import InlineMarkdownEdit from './InlineMarkdownEdit.vue'
import TableFloatingToolbar from './TableFloatingToolbar.vue'
import { useImageModal } from '@/Composables/useImageModal'
import { Download } from '@lucide/vue'

const props = defineProps<{
    documentId: string
    slug: string
    initialContent: string
    initialYjsState: string | null
    wsToken: string
}>()

const { t } = useI18n()
const editorReady = ref(false)

const {
    ydoc,
    yXmlFragment,
    wsProvider,
    userName,
    userColor,
    whenLocalSynced,
    connect,
} = useYjsProvider({
    documentId: props.documentId,
    wsToken: props.wsToken,
    initialStateBase64: props.initialYjsState,
})

const editor = useEditor({
    editable: false,
    extensions: [
        StarterKit.configure({
            undoRedo: false,
            codeBlock: false,
        }),
        CustomCodeBlock.configure({
            lowlight,
            defaultLanguage: 'plaintext',
        }),
        Placeholder.configure({
            placeholder: () => t('editor.placeholder'),
            showOnlyWhenEditable: true,
            showOnlyCurrent: true,
        }),
        Collaboration.configure({
            document: ydoc,
            fragment: yXmlFragment,
        }),
        CollaborationCaret.configure({
            provider: wsProvider,
            user: {
                name: userName,
                color: userColor,
            },
        }),
        TaskList,
        TaskItem.configure({
            nested: true,
        }),
        Highlight.configure({
            multicolor: false,
        }),
        Typography,
        Superscript,
        Subscript,
        Table.configure({
            resizable: true,
        }),
        TableRow,
        TableCell,
        TableHeader,
        CharacterCount,
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
    ],
    editorProps: {
        attributes: {
            class: 'tiptap prose prose-lg max-w-none focus:outline-none min-h-full',
        },
        handleDoubleClick: (view, pos, event) => {
            if (sourceMode.value) return false
            const $pos = view.state.doc.resolve(pos)
            const depth = $pos.depth > 0 ? 1 : 0
            if (depth === 0) return false
            const node = $pos.node(depth)
            const skip = ['table', 'codeBlock', 'image', 'horizontalRule']
            if (skip.includes(node.type.name)) return false
            const from = $pos.before(depth)
            const to = $pos.after(depth)
            const dom = view.nodeDOM(from)
            if (!(dom instanceof HTMLElement)) return false
            const storage = (editor.value?.storage as any)
            const serializer = storage?.markdown?.serializer
            if (!serializer) return false
            const tempDoc = view.state.schema.topNodeType.create(null, node)
            const md = serializer.serialize(tempDoc).trim()
            const containerEl = (event.target as HTMLElement).closest('[data-editor-container]') as HTMLElement
            if (!containerEl) return false
            inlineEditRef.value?.open(md, dom, containerEl).then((result: string | null) => {
                if (result !== null && editor.value) {
                    const ed = editor.value
                    const mdParser = (ed.storage as any)?.markdown?.parser
                    if (mdParser) {
                        const html = mdParser.parse(result)
                        if (typeof html === 'string') {
                            ed.chain()
                                .focus()
                                .insertContentAt({ from, to }, html)
                                .run()
                        }
                    }
                }
            })
            return true
        },
    },
    onCreate({ editor: ed }) {
        void whenLocalSynced.then(() => {
            if (yXmlFragment.length === 0 && props.initialContent) {
                ed.commands.setContent(props.initialContent, { emitUpdate: false })
            }

            connect()
            ed.setEditable(true)
            editorReady.value = true
        })
    },
})

const { open: openImageModal } = useImageModal()

function handleSlashImage(e: Event) {
    const detail = (e as CustomEvent).detail
    openImageModal().then((data) => {
        if (data && detail?.editor) {
            detail.editor.chain().focus().setImage({ src: data.src, alt: data.alt }).run()
        }
    })
}

onMounted(() => window.addEventListener('open-image-modal', handleSlashImage))
onUnmounted(() => window.removeEventListener('open-image-modal', handleSlashImage))

const inlineEditRef = ref<InstanceType<typeof InlineMarkdownEdit> | null>(null)

const characterCount = ref(0)
const wordCount = ref(0)
const sourceMode = ref(false)
const sourceContent = ref('')

function applySourceContent(emitUpdate: boolean) {
    if (!editor.value || !sourceMode.value) return

    const mdParser = (editor.value.storage as any)?.markdown?.parser
    const content = mdParser
        ? mdParser.parse(sourceContent.value)
        : sourceContent.value

    editor.value.commands.setContent(content, { emitUpdate })
}

function toggleSourceMode() {
    if (!editor.value) return

    if (!sourceMode.value) {
        sourceContent.value = (editor.value.storage as any).markdown.getMarkdown()
        sourceMode.value = true
    } else {
        applySourceContent(true)
        sourceMode.value = false
    }
}

const { onEditorUpdate } = useAutoSave(
    editor,
    props.slug,
    1500,
    () => applySourceContent(false),
)

watch(editor, (ed, _old, onCleanup) => {
    if (!ed) return
    ed.on('update', onEditorUpdate)
    onCleanup(() => ed.off('update', onEditorUpdate))
}, { immediate: true })

watch(
    () => editor.value?.storage.characterCount,
    (storage) => {
        if (storage) {
            characterCount.value = storage.characters()
            wordCount.value = storage.words()
        }
    },
    { deep: true, flush: 'post' }
)

function downloadFile(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}

function exportMarkdown() {
    const md = sourceMode.value
        ? sourceContent.value
        : (editor.value?.storage as any)?.markdown?.getMarkdown?.() ?? ''
    const filename = props.slug.split('/').pop() ?? 'document'
    downloadFile(md, `${filename}.md`, 'text/markdown;charset=utf-8')
}

function exportHtml() {
    applySourceContent(false)
    const body = editor.value?.getHTML() ?? ''
    const title = props.slug.split('/').pop() ?? 'document'
    const html = `<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${title}</title>\n</head>\n<body>\n${body}\n</body>\n</html>`
    downloadFile(html, `${title}.html`, 'text/html;charset=utf-8')
}
</script>

<template>
    <div class="flex flex-col h-full">
        <EditorToolbar v-if="editor && editorReady" :editor="editor" :source-mode="sourceMode" @toggle-source="toggleSourceMode" />
        <ImageInsertModal />

        <div
            v-if="!editorReady"
            class="flex flex-1 items-center justify-center text-sm text-neutral-500 dark:text-neutral-400"
            role="status"
            aria-live="polite"
        >
            <span class="inline-flex items-center gap-2">
                <span class="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-primary-500 dark:border-neutral-700 dark:border-t-primary-400" aria-hidden="true" />
                {{ t('editor.loading') }}
            </span>
        </div>

        <div v-show="editorReady && !sourceMode" data-editor-container class="relative flex-1 min-h-0 overflow-y-auto">
            <EditorContent
                :editor="editor"
                class="h-full"
            />

            <BubbleMenu
                v-if="editor"
                :editor="editor"
                plugin-key="tableMenu"
                :should-show="({ editor: e }: { editor: any }) => e.isActive('table')"
                :tippy-options="{ placement: 'top', duration: [150, 100] }"
            >
                <div class="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg px-1.5 py-1">
                    <TableFloatingToolbar :editor="editor" />
                </div>
            </BubbleMenu>

            <InlineMarkdownEdit ref="inlineEditRef" />
        </div>

        <div
            v-show="sourceMode"
            class="flex-1 min-h-0 overflow-y-auto"
        >
            <textarea
                v-model="sourceContent"
                spellcheck="false"
                :aria-label="t('editor.sourceLabel')"
                class="w-full h-full resize-none bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 font-mono text-sm leading-relaxed p-4 sm:p-6 focus:outline-none"
                :placeholder="t('editor.sourcePlaceholder')"
                @input="onEditorUpdate"
            />
        </div>

        <div
            v-if="editor && editorReady"
            class="shrink-0 flex items-center justify-between px-4 py-1.5 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-400 dark:text-neutral-500"
        >
            <div class="flex items-center gap-1">
                <button
                    type="button"
                    :aria-label="t('export.markdown')"
                    :title="t('export.markdown')"
                    class="flex items-center cursor-pointer gap-1 px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                    @click="exportMarkdown"
                >
                    <Download class="w-3 h-3" aria-hidden="true" />
                    <span>.md</span>
                </button>
                <button
                    type="button"
                    :aria-label="t('export.html')"
                    :title="t('export.html')"
                    class="flex items-center cursor-pointer gap-1 px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                    @click="exportHtml"
                >
                    <Download class="w-3 h-3" aria-hidden="true" />
                    <span>.html</span>
                </button>
            </div>
            <div class="flex items-center gap-3">
                <span>{{ t('editor.wordCount', { count: wordCount }) }}</span>
                <span>{{ t('editor.characterCount', { count: characterCount }) }}</span>
            </div>
        </div>
    </div>
</template>
