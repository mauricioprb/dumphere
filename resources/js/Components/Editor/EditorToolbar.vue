<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3';
import type { Component } from 'vue';
import { ref, watch, nextTick } from 'vue';
import { useI18n, type TranslationKey } from '@/Composables/useI18n';
import { useImageModal } from '@/Composables/useImageModal';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code,
    Highlighter,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    ListChecks,
    Quote,
    Minus,
    Braces,
    Table,
    ImageIcon,
    FileCode,
    FileText,
    Ellipsis,
    ChevronUp,
} from '@lucide/vue';

const props = defineProps<{
    editor: Editor;
    sourceMode: boolean;
}>();

const emit = defineEmits<{
    toggleSource: [];
}>();

const { open: openImageModal } = useImageModal();
const { t } = useI18n();

interface ToolbarButton {
    icon: Component;
    action: () => unknown;
    isActive: () => boolean;
    titleKey: TranslationKey;
    isToggle: boolean;
    type?: undefined;
}

interface ToolbarDivider {
    type: 'divider';
}

type ToolbarItem = ToolbarButton | ToolbarDivider;

const buttons: ToolbarItem[] = [
    createToggle(Bold, 'toolbar.bold', 'bold', () => props.editor.chain().focus().toggleBold().run()),
    createToggle(Italic, 'toolbar.italic', 'italic', () => props.editor.chain().focus().toggleItalic().run()),
    createToggle(Underline, 'toolbar.underline', 'underline', () =>
        props.editor.chain().focus().toggleUnderline().run(),
    ),
    createToggle(Strikethrough, 'toolbar.strike', 'strike', () => props.editor.chain().focus().toggleStrike().run()),
    createToggle(Code, 'toolbar.code', 'code', () => props.editor.chain().focus().toggleCode().run()),
    createToggle(Highlighter, 'toolbar.highlight', 'highlight', () =>
        props.editor.chain().focus().toggleHighlight().run(),
    ),
    { type: 'divider' },
    createToggle(
        Heading1,
        'toolbar.h1',
        'heading',
        () => props.editor.chain().focus().toggleHeading({ level: 1 }).run(),
        { level: 1 },
    ),
    createToggle(
        Heading2,
        'toolbar.h2',
        'heading',
        () => props.editor.chain().focus().toggleHeading({ level: 2 }).run(),
        { level: 2 },
    ),
    createToggle(
        Heading3,
        'toolbar.h3',
        'heading',
        () => props.editor.chain().focus().toggleHeading({ level: 3 }).run(),
        { level: 3 },
    ),
    { type: 'divider' },
    createToggle(List, 'toolbar.bulletList', 'bulletList', () => props.editor.chain().focus().toggleBulletList().run()),
    createToggle(ListOrdered, 'toolbar.orderedList', 'orderedList', () =>
        props.editor.chain().focus().toggleOrderedList().run(),
    ),
    createToggle(ListChecks, 'toolbar.taskList', 'taskList', () => props.editor.chain().focus().toggleTaskList().run()),
    createToggle(Quote, 'toolbar.blockquote', 'blockquote', () =>
        props.editor.chain().focus().toggleBlockquote().run(),
    ),
    { type: 'divider' },
    createAction(Minus, 'toolbar.horizontalRule', () => props.editor.chain().focus().setHorizontalRule().run()),
    createToggle(Braces, 'toolbar.codeBlock', 'codeBlock', () => props.editor.chain().focus().toggleCodeBlock().run()),
    createAction(Table, 'toolbar.table', () =>
        props.editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    ),
    createAction(ImageIcon, 'toolbar.image', insertImage),
];

function createToggle(
    icon: Component,
    titleKey: TranslationKey,
    activeName: string,
    action: () => unknown,
    attributes?: Record<string, number>,
): ToolbarButton {
    return {
        icon,
        titleKey,
        action,
        isActive: () => props.editor.isActive(activeName, attributes),
        isToggle: true,
    };
}

function createAction(icon: Component, titleKey: TranslationKey, action: () => unknown): ToolbarButton {
    return {
        icon,
        titleKey,
        action,
        isActive: () => false,
        isToggle: false,
    };
}

async function insertImage() {
    const image = await openImageModal();
    if (!image) return;

    props.editor.chain().focus().setImage({ src: image.src, alt: image.alt }).run();
}

let buttonIndex = 0;
const itemsWithIndex = buttons.map((item) => ({
    item,
    btnIdx: (item as ToolbarDivider).type === 'divider' ? -1 : buttonIndex++,
}));
const SOURCE_BUTTON_INDEX = buttonIndex;
const actionableItems = itemsWithIndex.filter(
    (entry): entry is { item: ToolbarButton; btnIdx: number } => entry.btnIdx >= 0,
);
const mobilePrimaryIndexes = new Set([0, 1, 9, 16]);
const mobilePrimaryItems = actionableItems.filter((entry) => mobilePrimaryIndexes.has(entry.btnIdx));
const mobileSecondaryItems = actionableItems.filter((entry) => !mobilePrimaryIndexes.has(entry.btnIdx));

const tabbableIdx = ref(0);
const desktopToolbarRef = ref<HTMLElement | null>(null);
const mobileExpanded = ref(false);
watch(
    () => props.sourceMode,
    (isSource) => {
        if (isSource) {
            tabbableIdx.value = SOURCE_BUTTON_INDEX;
            mobileExpanded.value = false;
        }
    },
);

function handleKeydown(event: KeyboardEvent) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();

    const all = Array.from(desktopToolbarRef.value?.querySelectorAll<HTMLButtonElement>('button') ?? []);
    const enabled = all.filter((b) => !b.disabled && b.offsetParent !== null);
    const current = document.activeElement as HTMLButtonElement;
    const idx = enabled.indexOf(current);
    if (idx === -1) return;

    let next: number;
    if (event.key === 'ArrowRight') next = (idx + 1) % enabled.length;
    else if (event.key === 'ArrowLeft') next = (idx - 1 + enabled.length) % enabled.length;
    else if (event.key === 'Home') next = 0;
    else next = enabled.length - 1;

    tabbableIdx.value = all.indexOf(enabled[next]);
    nextTick(() => enabled[next].focus());
}

function onButtonFocus(btnIdx: number) {
    tabbableIdx.value = btnIdx;
}

function runMobileAction(item: ToolbarButton) {
    item.action();
    mobileExpanded.value = false;
}
</script>

<template>
    <div class="editor-toolbar shrink-0 border-b border-(--workspace-rule)">
        <div
            ref="desktopToolbarRef"
            role="toolbar"
            :aria-label="t('toolbar.ariaLabel')"
            class="hidden min-h-12 items-center gap-0.5 overflow-x-auto px-[clamp(0.75rem,2vw,1.5rem)] sm:flex"
            @keydown="handleKeydown"
        >
            <template
                v-for="{ item, btnIdx } in itemsWithIndex"
                :key="btnIdx === -1 ? `divider-${buttons.indexOf(item)}` : btnIdx"
            >
                <div
                    v-if="(item as ToolbarDivider).type === 'divider'"
                    role="separator"
                    class="editor-toolbar__divider mx-1 h-5 w-px"
                />
                <button
                    v-else
                    type="button"
                    :tabindex="btnIdx === tabbableIdx ? 0 : -1"
                    :aria-label="t((item as ToolbarButton).titleKey)"
                    :aria-pressed="(item as ToolbarButton).isToggle ? (item as ToolbarButton).isActive() : undefined"
                    :disabled="sourceMode"
                    :title="t((item as ToolbarButton).titleKey)"
                    :class="[
                        'editor-tool editor-focus inline-flex size-9 shrink-0 items-center justify-center rounded-md transition-colors duration-100 focus:outline-none motion-reduce:transition-none',
                        sourceMode
                            ? 'editor-tool--disabled cursor-not-allowed'
                            : (item as ToolbarButton).isActive()
                              ? 'editor-tool--active'
                              : 'editor-tool--idle',
                    ]"
                    @click="(item as ToolbarButton).action()"
                    @focus="onButtonFocus(btnIdx)"
                >
                    <component
                        :is="(item as ToolbarButton).icon"
                        class="h-4 w-4"
                        :stroke-width="2"
                        aria-hidden="true"
                    />
                </button>
            </template>

            <div role="separator" class="editor-toolbar__divider mx-1 h-5 w-px" />
            <button
                type="button"
                :tabindex="SOURCE_BUTTON_INDEX === tabbableIdx ? 0 : -1"
                :aria-label="sourceMode ? t('toolbar.sourceOff') : t('toolbar.sourceOn')"
                :aria-pressed="sourceMode"
                :title="sourceMode ? t('toolbar.sourceOff') : t('toolbar.sourceOn')"
                :class="[
                    'editor-tool editor-focus inline-flex size-9 shrink-0 items-center justify-center rounded-md transition-colors duration-100 focus:outline-none motion-reduce:transition-none',
                    sourceMode ? 'editor-tool--active' : 'editor-tool--idle',
                ]"
                @click="emit('toggleSource')"
                @focus="onButtonFocus(SOURCE_BUTTON_INDEX)"
            >
                <component
                    :is="sourceMode ? FileText : FileCode"
                    class="h-4 w-4"
                    :stroke-width="2"
                    aria-hidden="true"
                />
            </button>
        </div>

        <div role="toolbar" :aria-label="t('toolbar.ariaLabel')" class="sm:hidden">
            <div class="flex min-h-14 items-center justify-around gap-1 px-2">
                <button
                    v-for="{ item, btnIdx } in mobilePrimaryItems"
                    :key="btnIdx"
                    type="button"
                    :aria-label="t(item.titleKey)"
                    :aria-pressed="item.isToggle ? item.isActive() : undefined"
                    :disabled="sourceMode"
                    :title="t(item.titleKey)"
                    :class="[
                        'editor-tool editor-focus inline-flex size-11 items-center justify-center rounded-md transition-colors focus:outline-none motion-reduce:transition-none',
                        sourceMode
                            ? 'editor-tool--disabled cursor-not-allowed'
                            : item.isActive()
                              ? 'editor-tool--active'
                              : 'editor-tool--idle',
                    ]"
                    @click="runMobileAction(item)"
                >
                    <component :is="item.icon" class="h-5 w-5" :stroke-width="2" aria-hidden="true" />
                </button>

                <button
                    type="button"
                    :aria-label="sourceMode ? t('toolbar.sourceOff') : t('toolbar.sourceOn')"
                    :aria-pressed="sourceMode"
                    :title="sourceMode ? t('toolbar.sourceOff') : t('toolbar.sourceOn')"
                    :class="[
                        'editor-tool editor-focus inline-flex size-11 items-center justify-center rounded-md transition-colors focus:outline-none motion-reduce:transition-none',
                        sourceMode ? 'editor-tool--active' : 'editor-tool--idle',
                    ]"
                    @click="emit('toggleSource')"
                >
                    <component
                        :is="sourceMode ? FileText : FileCode"
                        class="h-5 w-5"
                        :stroke-width="2"
                        aria-hidden="true"
                    />
                </button>

                <button
                    type="button"
                    :aria-label="mobileExpanded ? t('toolbar.less') : t('toolbar.more')"
                    :title="mobileExpanded ? t('toolbar.less') : t('toolbar.more')"
                    :aria-expanded="mobileExpanded"
                    aria-controls="mobile-format-options"
                    :disabled="sourceMode"
                    class="editor-tool editor-tool--idle editor-focus inline-flex size-11 items-center justify-center rounded-md transition-colors focus:outline-none disabled:cursor-not-allowed disabled:text-(--workspace-rule) motion-reduce:transition-none"
                    @click="mobileExpanded = !mobileExpanded"
                >
                    <ChevronUp v-if="mobileExpanded" class="h-5 w-5" aria-hidden="true" />
                    <Ellipsis v-else class="h-5 w-5" aria-hidden="true" />
                </button>
            </div>

            <div
                v-show="mobileExpanded"
                id="mobile-format-options"
                role="group"
                :aria-label="t('toolbar.more')"
                class="editor-toolbar__secondary grid grid-cols-6 gap-1 border-t border-(--workspace-rule) px-2 py-2"
            >
                <button
                    v-for="{ item, btnIdx } in mobileSecondaryItems"
                    :key="btnIdx"
                    type="button"
                    :aria-label="t(item.titleKey)"
                    :aria-pressed="item.isToggle ? item.isActive() : undefined"
                    :title="t(item.titleKey)"
                    :class="[
                        'editor-tool editor-focus inline-flex size-11 items-center justify-center justify-self-center rounded-md transition-colors focus:outline-none motion-reduce:transition-none',
                        item.isActive() ? 'editor-tool--active' : 'editor-tool--idle',
                    ]"
                    @click="runMobileAction(item)"
                >
                    <component :is="item.icon" class="h-5 w-5" :stroke-width="2" aria-hidden="true" />
                </button>
            </div>
        </div>
    </div>
</template>
