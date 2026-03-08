<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'
import { useI18n } from '@/Composables/useI18n'
import {
    Rows3 as RowsIcon,
    Columns3 as ColsIcon,
    Plus,
    Minus,
    Trash2,
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
} from 'lucide-vue-next'

const props = defineProps<{
    editor: Editor
}>()

const { t } = useI18n()

interface TableAction {
    icon: any
    secondaryIcon?: any
    label: string
    action: () => void
    danger?: boolean
}

const rowActions: TableAction[] = [
    {
        icon: ArrowUp,
        secondaryIcon: Plus,
        label: 'table.addRowBefore',
        action: () => props.editor.chain().focus().addRowBefore().run(),
    },
    {
        icon: ArrowDown,
        secondaryIcon: Plus,
        label: 'table.addRowAfter',
        action: () => props.editor.chain().focus().addRowAfter().run(),
    },
    {
        icon: RowsIcon,
        secondaryIcon: Minus,
        label: 'table.deleteRow',
        action: () => props.editor.chain().focus().deleteRow().run(),
        danger: true,
    },
]

const colActions: TableAction[] = [
    {
        icon: ArrowLeft,
        secondaryIcon: Plus,
        label: 'table.addColBefore',
        action: () => props.editor.chain().focus().addColumnBefore().run(),
    },
    {
        icon: ArrowRight,
        secondaryIcon: Plus,
        label: 'table.addColAfter',
        action: () => props.editor.chain().focus().addColumnAfter().run(),
    },
    {
        icon: ColsIcon,
        secondaryIcon: Minus,
        label: 'table.deleteCol',
        action: () => props.editor.chain().focus().deleteColumn().run(),
        danger: true,
    },
]
</script>

<template>
    <div class="flex items-center gap-0.5 flex-wrap">
        <button
            v-for="act in rowActions"
            :key="act.label"
            @click="act.action"
            :title="t(act.label as any)"
            :class="[
                'relative p-1.5 rounded transition-colors duration-100 shrink-0',
                act.danger
                    ? 'text-neutral-500 dark:text-neutral-400 hover:bg-danger-500/10 hover:text-danger-600 dark:hover:text-danger-400'
                    : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-800 dark:hover:text-neutral-200'
            ]"
        >
            <component :is="act.icon" class="w-4 h-4" :stroke-width="2" />
        </button>

        <div class="w-px h-4 bg-neutral-300 dark:bg-neutral-600 mx-0.5" />

        <button
            v-for="act in colActions"
            :key="act.label"
            @click="act.action"
            :title="t(act.label as any)"
            :class="[
                'relative p-1.5 rounded transition-colors duration-100 shrink-0',
                act.danger
                    ? 'text-neutral-500 dark:text-neutral-400 hover:bg-danger-500/10 hover:text-danger-600 dark:hover:text-danger-400'
                    : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-800 dark:hover:text-neutral-200'
            ]"
        >
            <component :is="act.icon" class="w-4 h-4" :stroke-width="2" />
        </button>

        <div class="w-px h-4 bg-neutral-300 dark:bg-neutral-600 mx-0.5" />

        <button
            @click="props.editor.chain().focus().deleteTable().run()"
            :title="t('table.delete' as any)"
            class="p-1.5 rounded transition-colors duration-100 shrink-0 text-neutral-500 dark:text-neutral-400 hover:bg-danger-500/10 hover:text-danger-600 dark:hover:text-danger-400"
        >
            <Trash2 class="w-4 h-4" :stroke-width="2" />
        </button>
    </div>
</template>
