<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, shallowRef } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'
import CharacterCount from '@tiptap/extension-character-count'
import { SlashCommands } from '@/Extensions/SlashCommands'
import { useYjsProvider } from '@/Composables/useYjsProvider'
import { useAutoSave } from '@/Composables/useAutoSave'
import { useI18n } from '@/Composables/useI18n'
import EditorToolbar from './EditorToolbar.vue'

const props = defineProps<{
    slug: string
    initialContent: string
}>()

const { t } = useI18n()

const {
    ydoc,
    yXmlFragment,
    wsProvider,
    awareness,
    isConnected,
    userName,
    userColor,
    whenSynced,
} = useYjsProvider(props.slug)

const editor = useEditor({
    extensions: [
        StarterKit.configure({
            undoRedo: false,
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
        CollaborationCursor.configure({
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
        Underline,
        Link.configure({
            openOnClick: false,
            HTMLAttributes: {
                class: 'text-primary-600 dark:text-primary-400 underline cursor-pointer',
            },
        }),
        Superscript,
        Subscript,
        Table.configure({
            resizable: true,
        }),
        TableRow,
        TableCell,
        TableHeader,
        CharacterCount,
        SlashCommands,
    ],
    editorProps: {
        attributes: {
            class: 'tiptap prose prose-lg max-w-none focus:outline-none min-h-full',
        },
    },
    onCreate({ editor: ed }) {
        whenSynced.then(() => {
            if (yXmlFragment.length === 0 && props.initialContent) {
                ed.commands.setContent(props.initialContent)
            }
        })
    },
})

const { scheduleSave, saveNow } = useAutoSave(editor, props.slug)

watch(
    () => editor.value?.getHTML(),
    () => {
        scheduleSave()
    },
    { flush: 'post' }
)

const characterCount = ref(0)
const wordCount = ref(0)

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
</script>

<template>
    <div class="flex flex-col h-full">
        <EditorToolbar v-if="editor" :editor="editor" />

        <EditorContent
            :editor="editor"
            class="flex-1 min-h-0 overflow-y-auto"
        />

        <div
            v-if="editor"
            class="shrink-0 flex items-center justify-end px-4 py-1.5 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-400 dark:text-neutral-500 gap-3"
        >
            <span>{{ wordCount }} palavras</span>
            <span>{{ characterCount }} caracteres</span>
        </div>
    </div>
</template>
