<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'
import { useI18n } from '@/Composables/useI18n'

const props = defineProps<{
    editor: Editor
}>()

const { t } = useI18n()

interface ToolbarButton {
    label: string
    action: () => void
    isActive: () => boolean
    title: string
    type?: undefined
}

interface ToolbarDivider {
    type: 'divider'
}

type ToolbarItem = ToolbarButton | ToolbarDivider

const buttons: ToolbarItem[] = [
    { label: 'B', action: () => props.editor.chain().focus().toggleBold().run(), isActive: () => props.editor.isActive('bold'), title: t('toolbar.bold') },
    { label: 'I', action: () => props.editor.chain().focus().toggleItalic().run(), isActive: () => props.editor.isActive('italic'), title: t('toolbar.italic') },
    { label: 'U', action: () => props.editor.chain().focus().toggleUnderline().run(), isActive: () => props.editor.isActive('underline'), title: t('toolbar.underline') },
    { label: 'S', action: () => props.editor.chain().focus().toggleStrike().run(), isActive: () => props.editor.isActive('strike'), title: t('toolbar.strike') },
    { label: '`', action: () => props.editor.chain().focus().toggleCode().run(), isActive: () => props.editor.isActive('code'), title: t('toolbar.code') },
    { label: '✦', action: () => props.editor.chain().focus().toggleHighlight().run(), isActive: () => props.editor.isActive('highlight'), title: t('toolbar.highlight') },
    { type: 'divider' },
    { label: 'H1', action: () => props.editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: () => props.editor.isActive('heading', { level: 1 }), title: t('toolbar.h1') },
    { label: 'H2', action: () => props.editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => props.editor.isActive('heading', { level: 2 }), title: t('toolbar.h2') },
    { label: 'H3', action: () => props.editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: () => props.editor.isActive('heading', { level: 3 }), title: t('toolbar.h3') },
    { type: 'divider' },
    { label: '•', action: () => props.editor.chain().focus().toggleBulletList().run(), isActive: () => props.editor.isActive('bulletList'), title: t('toolbar.bulletList') },
    { label: '1.', action: () => props.editor.chain().focus().toggleOrderedList().run(), isActive: () => props.editor.isActive('orderedList'), title: t('toolbar.orderedList') },
    { label: '☑', action: () => props.editor.chain().focus().toggleTaskList().run(), isActive: () => props.editor.isActive('taskList'), title: t('toolbar.taskList') },
    { label: '❝', action: () => props.editor.chain().focus().toggleBlockquote().run(), isActive: () => props.editor.isActive('blockquote'), title: t('toolbar.blockquote') },
    { type: 'divider' },
    { label: '—', action: () => props.editor.chain().focus().setHorizontalRule().run(), isActive: () => false, title: t('toolbar.horizontalRule') },
    { label: '{ }', action: () => props.editor.chain().focus().toggleCodeBlock().run(), isActive: () => props.editor.isActive('codeBlock'), title: t('toolbar.codeBlock') },
    { label: '▦', action: () => props.editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), isActive: () => props.editor.isActive('table'), title: t('toolbar.table') },
]
</script>

<template>
    <div class="flex items-center gap-0.5 px-3 py-1.5 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50/80 dark:bg-neutral-800/80 overflow-x-auto shrink-0">
        <template v-for="(btn, index) in buttons" :key="index">
            <div
                v-if="(btn as ToolbarDivider).type === 'divider'"
                class="w-px h-5 bg-neutral-300 dark:bg-neutral-600 mx-1"
            />
            <button
                v-else
                @click="(btn as ToolbarButton).action()"
                :title="(btn as ToolbarButton).title"
                :class="[
                    'px-2 py-1 rounded text-sm font-medium transition-colors duration-100',
                    (btn as ToolbarButton).isActive()
                        ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100'
                ]"
            >
                {{ (btn as ToolbarButton).label }}
            </button>
        </template>
    </div>
</template>
