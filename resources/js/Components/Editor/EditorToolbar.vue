<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'
import type { Component } from 'vue'
import { useI18n } from '@/Composables/useI18n'
import { useImageModal } from '@/Composables/useImageModal'
import {
    Bold, Italic, Underline, Strikethrough, Code, Highlighter,
    Heading1, Heading2, Heading3,
    List, ListOrdered, ListChecks, Quote,
    Minus, Braces, Table, ImageIcon,
    FileCode, FileText,
} from 'lucide-vue-next'

const props = defineProps<{
    editor: Editor
    sourceMode: boolean
}>()

const emit = defineEmits<{
    toggleSource: []
}>()

const { open: openImageModal } = useImageModal()

const { t } = useI18n()

interface ToolbarButton {
    icon: Component
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
    { icon: Bold, action: () => props.editor.chain().focus().toggleBold().run(), isActive: () => props.editor.isActive('bold'), title: t('toolbar.bold') },
    { icon: Italic, action: () => props.editor.chain().focus().toggleItalic().run(), isActive: () => props.editor.isActive('italic'), title: t('toolbar.italic') },
    { icon: Underline, action: () => props.editor.chain().focus().toggleUnderline().run(), isActive: () => props.editor.isActive('underline'), title: t('toolbar.underline') },
    { icon: Strikethrough, action: () => props.editor.chain().focus().toggleStrike().run(), isActive: () => props.editor.isActive('strike'), title: t('toolbar.strike') },
    { icon: Code, action: () => props.editor.chain().focus().toggleCode().run(), isActive: () => props.editor.isActive('code'), title: t('toolbar.code') },
    { icon: Highlighter, action: () => props.editor.chain().focus().toggleHighlight().run(), isActive: () => props.editor.isActive('highlight'), title: t('toolbar.highlight') },
    { type: 'divider' },
    { icon: Heading1, action: () => props.editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: () => props.editor.isActive('heading', { level: 1 }), title: t('toolbar.h1') },
    { icon: Heading2, action: () => props.editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => props.editor.isActive('heading', { level: 2 }), title: t('toolbar.h2') },
    { icon: Heading3, action: () => props.editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: () => props.editor.isActive('heading', { level: 3 }), title: t('toolbar.h3') },
    { type: 'divider' },
    { icon: List, action: () => props.editor.chain().focus().toggleBulletList().run(), isActive: () => props.editor.isActive('bulletList'), title: t('toolbar.bulletList') },
    { icon: ListOrdered, action: () => props.editor.chain().focus().toggleOrderedList().run(), isActive: () => props.editor.isActive('orderedList'), title: t('toolbar.orderedList') },
    { icon: ListChecks, action: () => props.editor.chain().focus().toggleTaskList().run(), isActive: () => props.editor.isActive('taskList'), title: t('toolbar.taskList') },
    { icon: Quote, action: () => props.editor.chain().focus().toggleBlockquote().run(), isActive: () => props.editor.isActive('blockquote'), title: t('toolbar.blockquote') },
    { type: 'divider' },
    { icon: Minus, action: () => props.editor.chain().focus().setHorizontalRule().run(), isActive: () => false, title: t('toolbar.horizontalRule') },
    { icon: Braces, action: () => props.editor.chain().focus().toggleCodeBlock().run(), isActive: () => props.editor.isActive('codeBlock'), title: t('toolbar.codeBlock') },
    { icon: Table, action: () => props.editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), isActive: () => props.editor.isActive('table'), title: t('toolbar.table') },
    { icon: ImageIcon, action: async () => {
        const data = await openImageModal()
        if (data) {
            props.editor.chain().focus().setImage({ src: data.src, alt: data.alt }).run()
        }
    }, isActive: () => false, title: t('toolbar.image') },
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
                :disabled="sourceMode"
                :class="[
                    'p-1.5 rounded transition-colors duration-100 shrink-0',
                    sourceMode
                        ? 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
                        : (btn as ToolbarButton).isActive()
                            ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100'
                ]"
            >
                <component :is="(btn as ToolbarButton).icon" class="w-4 h-4" :stroke-width="2" />
            </button>
        </template>

        <!-- Source mode toggle -->
        <div class="w-px h-5 bg-neutral-300 dark:bg-neutral-600 mx-1" />
        <button
            @click="emit('toggleSource')"
            :title="sourceMode ? t('toolbar.sourceOff') : t('toolbar.sourceOn')"
            :class="[
                'p-1.5 rounded transition-colors duration-100 shrink-0',
                sourceMode
                    ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100'
            ]"
        >
            <component :is="sourceMode ? FileText : FileCode" class="w-4 h-4" :stroke-width="2" />
        </button>
    </div>
</template>
