<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'
import type { Component } from 'vue'
import { ref, watch, nextTick } from 'vue'
import { useI18n } from '@/Composables/useI18n'
import { useImageModal } from '@/Composables/useImageModal'
import {
    Bold, Italic, Underline, Strikethrough, Code, Highlighter,
    Heading1, Heading2, Heading3,
    List, ListOrdered, ListChecks, Quote,
    Minus, Braces, Table, ImageIcon,
    FileCode, FileText,
} from '@lucide/vue'

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
    isToggle: boolean
    type?: undefined
}

interface ToolbarDivider {
    type: 'divider'
}

type ToolbarItem = ToolbarButton | ToolbarDivider

const buttons: ToolbarItem[] = [
    { icon: Bold,          action: () => props.editor.chain().focus().toggleBold().run(),                                                isActive: () => props.editor.isActive('bold'),              title: t('toolbar.bold'),          isToggle: true },
    { icon: Italic,        action: () => props.editor.chain().focus().toggleItalic().run(),                                              isActive: () => props.editor.isActive('italic'),            title: t('toolbar.italic'),        isToggle: true },
    { icon: Underline,     action: () => props.editor.chain().focus().toggleUnderline().run(),                                           isActive: () => props.editor.isActive('underline'),         title: t('toolbar.underline'),     isToggle: true },
    { icon: Strikethrough, action: () => props.editor.chain().focus().toggleStrike().run(),                                              isActive: () => props.editor.isActive('strike'),            title: t('toolbar.strike'),        isToggle: true },
    { icon: Code,          action: () => props.editor.chain().focus().toggleCode().run(),                                                isActive: () => props.editor.isActive('code'),              title: t('toolbar.code'),          isToggle: true },
    { icon: Highlighter,   action: () => props.editor.chain().focus().toggleHighlight().run(),                                           isActive: () => props.editor.isActive('highlight'),         title: t('toolbar.highlight'),     isToggle: true },
    { type: 'divider' },
    { icon: Heading1,      action: () => props.editor.chain().focus().toggleHeading({ level: 1 }).run(),                                 isActive: () => props.editor.isActive('heading', { level: 1 }), title: t('toolbar.h1'),       isToggle: true },
    { icon: Heading2,      action: () => props.editor.chain().focus().toggleHeading({ level: 2 }).run(),                                 isActive: () => props.editor.isActive('heading', { level: 2 }), title: t('toolbar.h2'),       isToggle: true },
    { icon: Heading3,      action: () => props.editor.chain().focus().toggleHeading({ level: 3 }).run(),                                 isActive: () => props.editor.isActive('heading', { level: 3 }), title: t('toolbar.h3'),       isToggle: true },
    { type: 'divider' },
    { icon: List,          action: () => props.editor.chain().focus().toggleBulletList().run(),                                          isActive: () => props.editor.isActive('bulletList'),        title: t('toolbar.bulletList'),    isToggle: true },
    { icon: ListOrdered,   action: () => props.editor.chain().focus().toggleOrderedList().run(),                                         isActive: () => props.editor.isActive('orderedList'),       title: t('toolbar.orderedList'),   isToggle: true },
    { icon: ListChecks,    action: () => props.editor.chain().focus().toggleTaskList().run(),                                            isActive: () => props.editor.isActive('taskList'),          title: t('toolbar.taskList'),      isToggle: true },
    { icon: Quote,         action: () => props.editor.chain().focus().toggleBlockquote().run(),                                          isActive: () => props.editor.isActive('blockquote'),        title: t('toolbar.blockquote'),    isToggle: true },
    { type: 'divider' },
    { icon: Minus,         action: () => props.editor.chain().focus().setHorizontalRule().run(),                                         isActive: () => false,                                      title: t('toolbar.horizontalRule'), isToggle: false },
    { icon: Braces,        action: () => props.editor.chain().focus().toggleCodeBlock().run(),                                           isActive: () => props.editor.isActive('codeBlock'),         title: t('toolbar.codeBlock'),     isToggle: true },
    { icon: Table,         action: () => props.editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),       isActive: () => props.editor.isActive('table'),             title: t('toolbar.table'),         isToggle: false },
    { icon: ImageIcon,     action: async () => { const d = await openImageModal(); if (d) props.editor.chain().focus().setImage({ src: d.src, alt: d.alt }).run() }, isActive: () => false, title: t('toolbar.image'), isToggle: false },
]

let _idx = 0
const itemsWithIndex = buttons.map(item => ({
    item,
    btnIdx: (item as ToolbarDivider).type === 'divider' ? -1 : _idx++,
}))
const SOURCE_BTN_IDX = _idx

const tabbableIdx = ref(0)
const toolbarRef = ref<HTMLElement | null>(null)
watch(() => props.sourceMode, (isSource) => {
    if (isSource) tabbableIdx.value = SOURCE_BTN_IDX
})

function handleKeydown(event: KeyboardEvent) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()

    const all = Array.from(toolbarRef.value?.querySelectorAll<HTMLButtonElement>('button') ?? [])
    const enabled = all.filter(b => !b.disabled)
    const current = document.activeElement as HTMLButtonElement
    const idx = enabled.indexOf(current)
    if (idx === -1) return

    let next: number
    if (event.key === 'ArrowRight') next = (idx + 1) % enabled.length
    else if (event.key === 'ArrowLeft') next = (idx - 1 + enabled.length) % enabled.length
    else if (event.key === 'Home') next = 0
    else next = enabled.length - 1

    tabbableIdx.value = all.indexOf(enabled[next])
    nextTick(() => enabled[next].focus())
}

function onButtonFocus(btnIdx: number) {
    tabbableIdx.value = btnIdx
}
</script>

<template>
    <div
        ref="toolbarRef"
        role="toolbar"
        :aria-label="t('toolbar.ariaLabel')"
        class="flex items-center gap-0.5 px-3 py-1.5 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50/80 dark:bg-neutral-800/80 overflow-x-auto shrink-0"
        @keydown="handleKeydown"
    >
        <template v-for="({ item, btnIdx }) in itemsWithIndex" :key="btnIdx === -1 ? 'div-' + btnIdx : btnIdx">
            <div
                v-if="(item as ToolbarDivider).type === 'divider'"
                role="separator"
                class="w-px h-5 bg-neutral-300 dark:bg-neutral-600 mx-1"
            />
            <button
                v-else
                type="button"
                :tabindex="btnIdx === tabbableIdx ? 0 : -1"
                :aria-label="(item as ToolbarButton).title"
                :aria-pressed="(item as ToolbarButton).isToggle ? (item as ToolbarButton).isActive() : undefined"
                :aria-disabled="sourceMode || undefined"
                :disabled="sourceMode"
                :title="(item as ToolbarButton).title"
                :class="[
                    'p-1.5 rounded transition-colors duration-100 shrink-0',
                    sourceMode
                        ? 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
                        : (item as ToolbarButton).isActive()
                            ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100'
                ]"
                @click="(item as ToolbarButton).action()"
                @focus="onButtonFocus(btnIdx)"
            >
                <component :is="(item as ToolbarButton).icon" class="w-4 h-4" :stroke-width="2" aria-hidden="true" />
            </button>
        </template>

        <div role="separator" class="w-px h-5 bg-neutral-300 dark:bg-neutral-600 mx-1" />
        <button
            type="button"
            :tabindex="SOURCE_BTN_IDX === tabbableIdx ? 0 : -1"
            :aria-label="sourceMode ? t('toolbar.sourceOff') : t('toolbar.sourceOn')"
            :aria-pressed="sourceMode"
            :title="sourceMode ? t('toolbar.sourceOff') : t('toolbar.sourceOn')"
            :class="[
                'p-1.5 rounded transition-colors duration-100 shrink-0',
                sourceMode
                    ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100'
            ]"
            @click="emit('toggleSource')"
            @focus="onButtonFocus(SOURCE_BTN_IDX)"
        >
            <component :is="sourceMode ? FileText : FileCode" class="w-4 h-4" :stroke-width="2" aria-hidden="true" />
        </button>
    </div>
</template>
