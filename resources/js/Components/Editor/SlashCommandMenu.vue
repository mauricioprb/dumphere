<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount } from 'vue';
import type { Editor } from '@tiptap/core';
import { useI18n, type TranslationKey } from '@/Composables/useI18n';
import type { SlashCommandItem } from '@/Extensions/SlashCommands';
import {
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    ListChecks,
    Quote,
    Braces,
    Minus,
    Table,
    ImageIcon,
} from '@lucide/vue';
import type { Component } from 'vue';

const iconMap: Record<string, Component> = {
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    ListChecks,
    Quote,
    Braces,
    Minus,
    Table,
    ImageIcon,
};

const props = defineProps<{
    items: SlashCommandItem[];
    command: (item: SlashCommandItem) => void;
    editor: Editor;
    menuId: string;
}>();

const { t } = useI18n();
const selectedIndex = ref(0);
const scrollContainer = ref<HTMLElement | null>(null);

watch(
    () => props.items,
    () => {
        selectedIndex.value = 0;
    },
);

const optionId = (index: number) => `${props.menuId}-option-${index}`;

function syncActiveDescendant() {
    const editorElement = props.editor?.view?.dom as HTMLElement | undefined;
    if (!editorElement) return;

    const hasSelection = props.items.length > 0 && props.items[selectedIndex.value];
    if (hasSelection) {
        editorElement.setAttribute('aria-activedescendant', optionId(selectedIndex.value));
    } else {
        editorElement.removeAttribute('aria-activedescendant');
    }
}

watch([selectedIndex, () => props.items], () => nextTick(syncActiveDescendant), {
    immediate: true,
    deep: true,
});

onBeforeUnmount(() => {
    const editorElement = props.editor?.view?.dom as HTMLElement | undefined;
    editorElement?.removeAttribute('aria-activedescendant');
});

function onKeyDown(event: KeyboardEvent): boolean {
    if (event.key === 'ArrowUp') {
        selectedIndex.value = (selectedIndex.value + props.items.length - 1) % props.items.length;
        scrollToSelected();
        return true;
    }
    if (event.key === 'ArrowDown') {
        selectedIndex.value = (selectedIndex.value + 1) % props.items.length;
        scrollToSelected();
        return true;
    }
    if (event.key === 'Enter') {
        selectItem(selectedIndex.value);
        return true;
    }
    return false;
}

function scrollToSelected() {
    nextTick(() => {
        const container = scrollContainer.value;
        if (!container) return;
        const selected = container.querySelector('[data-selected]');
        selected?.scrollIntoView({ block: 'nearest' });
    });
}

function selectItem(index: number) {
    const item = props.items[index];
    if (item) {
        props.command(item);
    }
}

function translateLabel(key: string) {
    return t(key as TranslationKey);
}

defineExpose({ onKeyDown });
</script>

<template>
    <div
        :id="menuId"
        ref="scrollContainer"
        role="listbox"
        tabindex="-1"
        :aria-label="t('slash.ariaLabel')"
        class="slash-menu editor-menu max-h-80 w-72 overflow-y-auto rounded-lg py-1"
    >
        <template v-if="items.length > 0">
            <div
                v-for="(item, index) in items"
                :id="optionId(index)"
                :key="item.titleKey"
                role="option"
                :aria-selected="index === selectedIndex"
                :data-selected="index === selectedIndex ? '' : undefined"
                class="editor-menu__item flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left"
                :class="index === selectedIndex ? 'editor-menu__item--selected' : 'editor-menu__item--idle'"
                @click="selectItem(index)"
                @mousedown.prevent
                @mouseenter="selectedIndex = index"
            >
                <span class="flex size-8 shrink-0 items-center justify-center">
                    <img
                        v-if="item.icon.startsWith('emoji:')"
                        :src="`/images/emojis/${item.icon.slice(6)}`"
                        class="size-6 object-contain"
                        alt=""
                    />
                    <component
                        :is="iconMap[item.icon]"
                        v-else
                        class="h-5 w-5"
                        :stroke-width="1.75"
                        aria-hidden="true"
                    />
                </span>
                <div class="min-w-0">
                    <div class="truncate text-sm font-medium">{{ translateLabel(item.titleKey) }}</div>
                    <div class="truncate text-xs opacity-70">
                        {{ translateLabel(item.descKey) }}
                    </div>
                </div>
            </div>
        </template>
        <div v-else class="px-3 py-4 text-center text-sm text-(--workspace-muted)">
            {{ t('slash.noResults') }}
        </div>
    </div>
</template>
