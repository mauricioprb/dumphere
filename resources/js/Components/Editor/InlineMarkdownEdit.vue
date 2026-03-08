<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'

const isOpen = ref(false)
const markdownText = ref('')
const inputEl = ref<HTMLTextAreaElement | null>(null)
const position = ref({ top: 0, left: 0, width: 0, minHeight: 0, paddingLeft: '0px', paddingRight: '0px', paddingTop: '0px', paddingBottom: '0px', fontSize: '16px', lineHeight: '1.5' })

let resolveCallback: ((value: string | null) => void) | null = null

function open(md: string, dom: HTMLElement, containerEl: HTMLElement) {
    const containerRect = containerEl.getBoundingClientRect()
    const rect = dom.getBoundingClientRect()
    const cs = window.getComputedStyle(dom)

    markdownText.value = md
    position.value = {
        top: rect.top - containerRect.top + containerEl.scrollTop,
        left: rect.left - containerRect.left,
        width: rect.width,
        minHeight: rect.height,
        paddingLeft: cs.paddingLeft,
        paddingRight: cs.paddingRight,
        paddingTop: cs.paddingTop,
        paddingBottom: cs.paddingBottom,
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight,
    }

    isOpen.value = true

    return new Promise<string | null>((resolve) => {
        resolveCallback = resolve
        nextTick(() => {
            if (inputEl.value) {
                inputEl.value.focus()
                autoResize()
                const len = inputEl.value.value.length
                inputEl.value.setSelectionRange(len, len)
            }
        })
    })
}

function finish(apply: boolean) {
    if (!isOpen.value) return
    const val = apply ? markdownText.value.trim() : null
    isOpen.value = false
    resolveCallback?.(val)
    resolveCallback = null
}

function onBlur() {
    setTimeout(() => {
        if (isOpen.value) finish(true)
    }, 80)
}

function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        finish(false)
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !markdownText.value.includes('\n')) {
        e.preventDefault()
        finish(true)
    }
}

function autoResize() {
    const el = inputEl.value
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.max(el.scrollHeight, position.value.minHeight) + 'px'
}

watch(markdownText, () => nextTick(autoResize))

defineExpose({ open })
</script>

<template>
    <div
        v-if="isOpen"
        class="absolute z-30"
        :style="{
            top: position.top + 'px',
            left: position.left + 'px',
            width: position.width + 'px',
        }"
    >
        <textarea
            ref="inputEl"
            v-model="markdownText"
            @keydown="onKeydown"
            @blur="onBlur"
            @input="autoResize"
            spellcheck="false"
            rows="1"
            class="w-full resize-none bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 font-mono border-none focus:outline-none caret-neutral-500"
            :style="{
                minHeight: position.minHeight + 'px',
                paddingLeft: position.paddingLeft,
                paddingRight: position.paddingRight,
                paddingTop: position.paddingTop,
                paddingBottom: position.paddingBottom,
                fontSize: position.fontSize,
                lineHeight: position.lineHeight,
            }"
        />
    </div>
</template>
