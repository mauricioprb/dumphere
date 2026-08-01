<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3';
import type { Component } from 'vue';
import { useI18n, type TranslationKey } from '@/Composables/useI18n';
import {
    Rows3 as RowsIcon,
    Columns3 as ColsIcon,
    Trash2,
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
} from '@lucide/vue';

const props = defineProps<{
    editor: Editor;
}>();

const { t } = useI18n();

interface TableAction {
    icon: Component;
    label: TranslationKey;
    action: () => void;
    danger?: boolean;
}

const rowActions: TableAction[] = [
    {
        icon: ArrowUp,
        label: 'table.addRowBefore',
        action: () => props.editor.chain().focus().addRowBefore().run(),
    },
    {
        icon: ArrowDown,
        label: 'table.addRowAfter',
        action: () => props.editor.chain().focus().addRowAfter().run(),
    },
    {
        icon: RowsIcon,
        label: 'table.deleteRow',
        action: () => props.editor.chain().focus().deleteRow().run(),
        danger: true,
    },
];

const colActions: TableAction[] = [
    {
        icon: ArrowLeft,
        label: 'table.addColBefore',
        action: () => props.editor.chain().focus().addColumnBefore().run(),
    },
    {
        icon: ArrowRight,
        label: 'table.addColAfter',
        action: () => props.editor.chain().focus().addColumnAfter().run(),
    },
    {
        icon: ColsIcon,
        label: 'table.deleteCol',
        action: () => props.editor.chain().focus().deleteColumn().run(),
        danger: true,
    },
];
</script>

<template>
    <div class="flex flex-wrap items-center gap-0.5">
        <button
            v-for="act in rowActions"
            :key="act.label"
            type="button"
            :aria-label="t(act.label)"
            :title="t(act.label)"
            :class="[
                'editor-tool editor-focus relative inline-flex size-10 shrink-0 items-center justify-center rounded-md',
                act.danger
                    ? 'text-(--workspace-muted) hover:bg-(--workspace-panel) hover:text-(--workspace-danger)'
                    : 'editor-tool--idle',
            ]"
            @click="act.action"
        >
            <component :is="act.icon" class="h-4 w-4" :stroke-width="2" aria-hidden="true" />
        </button>

        <div class="editor-toolbar__divider mx-0.5 h-4 w-px" />

        <button
            v-for="act in colActions"
            :key="act.label"
            type="button"
            :aria-label="t(act.label)"
            :title="t(act.label)"
            :class="[
                'editor-tool editor-focus relative inline-flex size-10 shrink-0 items-center justify-center rounded-md',
                act.danger
                    ? 'text-(--workspace-muted) hover:bg-(--workspace-panel) hover:text-(--workspace-danger)'
                    : 'editor-tool--idle',
            ]"
            @click="act.action"
        >
            <component :is="act.icon" class="h-4 w-4" :stroke-width="2" aria-hidden="true" />
        </button>

        <div class="editor-toolbar__divider mx-0.5 h-4 w-px" />

        <button
            type="button"
            :aria-label="t('table.delete')"
            :title="t('table.delete')"
            class="editor-tool editor-focus inline-flex size-10 shrink-0 items-center justify-center rounded-md text-(--workspace-muted) hover:bg-(--workspace-panel) hover:text-(--workspace-danger)"
            @click="props.editor.chain().focus().deleteTable().run()"
        >
            <Trash2 class="h-4 w-4" :stroke-width="2" aria-hidden="true" />
        </button>
    </div>
</template>
