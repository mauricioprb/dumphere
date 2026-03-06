<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useI18n } from '@/Composables/useI18n'
import {
    Heading1, Heading2, Heading3,
    List, ListOrdered, ListChecks, Quote,
    Braces, Minus, Table,
} from 'lucide-vue-next'
import type { Component } from 'vue'

const iconMap: Record<string, Component> = {
    Heading1, Heading2, Heading3,
    List, ListOrdered, ListChecks, Quote,
    Braces, Minus, Table,
}

interface SlashItem {
    titleKey: string
    descKey: string
    icon: string
    command: (props: { editor: any; range: any }) => void
}

const props = defineProps<{
    items: SlashItem[]
    command: (item: SlashItem) => void
}>()

const { t } = useI18n()
const selectedIndex = ref(0)
const scrollContainer = ref<HTMLElement | null>(null)

watch(() => props.items, () => {
    selectedIndex.value = 0
})

function onKeyDown(event: KeyboardEvent): boolean {
    if (event.key === 'ArrowUp') {
        selectedIndex.value = (selectedIndex.value + props.items.length - 1) % props.items.length
        scrollToSelected()
        return true
    }
    if (event.key === 'ArrowDown') {
        selectedIndex.value = (selectedIndex.value + 1) % props.items.length
        scrollToSelected()
        return true
    }
    if (event.key === 'Enter') {
        selectItem(selectedIndex.value)
        return true
    }
    return false
}

function scrollToSelected() {
    nextTick(() => {
        const container = scrollContainer.value
        if (!container) return
        const selected = container.querySelector('[data-selected]')
        selected?.scrollIntoView({ block: 'nearest' })
    })
}

function selectItem(index: number) {
    const item = props.items[index]
    if (item) {
        props.command(item)
    }
}

// Expose onKeyDown for the parent extension
defineExpose({ onKeyDown })
</script>

<template>
    <div
        ref="scrollContainer"
        class="slash-menu bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg overflow-y-auto max-h-80 w-72 py-1"
    >
        <template v-if="items.length > 0">
            <button
                v-for="(item, index) in items"
                :key="item.titleKey"
                :data-selected="index === selectedIndex ? '' : undefined"
                class="flex items-center gap-3 w-full px-3 py-2 text-left transition-colors duration-75"
                :class="index === selectedIndex
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'"
                @click="selectItem(index)"
                @mouseenter="selectedIndex = index"
            >
                <span class="shrink-0 w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                    <component :is="iconMap[item.icon]" class="w-5 h-5" :stroke-width="1.75" />
                </span>
                <div class="min-w-0">
                    <div class="text-sm font-medium truncate">{{ t(item.titleKey as any) }}</div>
                    <div class="text-xs text-neutral-500 dark:text-neutral-400 truncate">{{ t(item.descKey as any) }}</div>
                </div>
            </button>
        </template>
        <div
            v-else
            class="px-3 py-4 text-sm text-neutral-400 dark:text-neutral-500 text-center"
        >
            {{ t('slash.noResults') }}
        </div>
    </div>
</template>
