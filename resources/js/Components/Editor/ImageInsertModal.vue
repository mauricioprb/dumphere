<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { ImageIcon, X } from '@lucide/vue'
import { useImageModal } from '@/Composables/useImageModal'
import { useI18n } from '@/Composables/useI18n'
import { normalizeImageUrl } from '@/Lib/imageUrl'

const { isOpen, confirm, cancel } = useImageModal()
const { t } = useI18n()

const url = ref('')
const alt = ref('')
const urlInput = ref<HTMLInputElement | null>(null)
const formRef = ref<HTMLFormElement | null>(null)
const previewError = ref(false)
const previewLoaded = ref(false)
const invalidUrl = ref(false)
const previewUrl = computed(() => normalizeImageUrl(url.value))
let previouslyFocused: HTMLElement | null = null

watch(isOpen, (open) => {
    if (open) {
        previouslyFocused = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null
        url.value = ''
        alt.value = ''
        previewError.value = false
        previewLoaded.value = false
        invalidUrl.value = false
        nextTick(() => urlInput.value?.focus())
    } else {
        const focusTarget = previouslyFocused
        previouslyFocused = null
        nextTick(() => focusTarget?.focus())
    }
})

watch(url, () => {
    previewError.value = false
    previewLoaded.value = false
    invalidUrl.value = false
})

function onSubmit() {
    const src = normalizeImageUrl(url.value)
    if (!src) {
        invalidUrl.value = true
        urlInput.value?.focus()
        return
    }

    confirm({ src, alt: alt.value.trim() })
}

function onOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) cancel()
}

function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
        cancel()
        return
    }

    if (e.key !== 'Tab') return

    const focusable = Array.from(
        formRef.value?.querySelectorAll<HTMLElement>(
            'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
    )
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
    }
}
</script>

<template>
    <Teleport to="body">
        <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div
                v-if="isOpen"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                @click="onOverlayClick"
                @keydown="onKeydown"
            >
                <Transition
                    enter-active-class="transition duration-150 ease-out"
                    enter-from-class="opacity-0 scale-95 translate-y-2"
                    enter-to-class="opacity-100 scale-100 translate-y-0"
                    leave-active-class="transition duration-100 ease-in"
                    leave-from-class="opacity-100 scale-100 translate-y-0"
                    leave-to-class="opacity-0 scale-95 translate-y-2"
                >
                    <form
                        v-if="isOpen"
                        ref="formRef"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="image-modal-title"
                        @submit.prevent="onSubmit"
                        class="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 w-full max-w-md overflow-hidden"
                    >
                        <div class="flex items-center gap-3 px-5 py-4 border-b border-neutral-100 dark:border-neutral-700">
                            <div class="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0" aria-hidden="true">
                                <ImageIcon class="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h2 id="image-modal-title" class="text-base font-semibold text-neutral-800 dark:text-neutral-100 flex-1">
                                {{ t('imageModal.title') }}
                            </h2>
                            <button
                                type="button"
                                :aria-label="t('imageModal.cancel')"
                                @click="cancel"
                                class="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                            >
                                <X class="w-4 h-4" aria-hidden="true" />
                            </button>
                        </div>

                        <div class="px-5 py-4 space-y-4">
                            <div class="space-y-1.5">
                                <label
                                    for="image-url"
                                    class="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                                >
                                    {{ t('imageModal.urlLabel') }}
                                </label>
                                <input
                                    id="image-url"
                                    ref="urlInput"
                                    v-model="url"
                                    type="url"
                                    :placeholder="t('imageModal.urlPlaceholder')"
                                    :aria-invalid="invalidUrl || undefined"
                                    :aria-describedby="invalidUrl ? 'image-url-error' : undefined"
                                    class="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-neutral-400 dark:placeholder-neutral-500"
                                    required
                                />
                                <p
                                    v-if="invalidUrl"
                                    id="image-url-error"
                                    class="text-xs text-danger-600 dark:text-danger-400"
                                    role="alert"
                                >
                                    {{ t('imageModal.invalidUrl') }}
                                </p>
                            </div>

                            <div class="space-y-1.5">
                                <label
                                    for="image-alt"
                                    class="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                                >
                                    {{ t('imageModal.altLabel') }}
                                </label>
                                <input
                                    id="image-alt"
                                    v-model="alt"
                                    type="text"
                                    :placeholder="t('imageModal.altPlaceholder')"
                                    class="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-neutral-400 dark:placeholder-neutral-500"
                                />
                            </div>

                            <div
                                v-if="previewUrl && !previewError"
                                class="space-y-1.5"
                            >
                                <span class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    {{ t('imageModal.preview') }}
                                </span>
                                <div class="rounded-lg border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900 p-2 flex items-center justify-center min-h-20 max-h-50 overflow-hidden">
                                    <img
                                        :src="previewUrl"
                                        :alt="alt || 'Preview'"
                                        class="max-w-full max-h-45 object-contain rounded"
                                        @load="previewLoaded = true"
                                        @error="previewError = true"
                                    />
                                    <span
                                        v-if="!previewLoaded && !previewError"
                                        class="text-xs text-neutral-400 dark:text-neutral-500"
                                    >
                                        {{ t('imageModal.loading') }}
                                    </span>
                                </div>
                            </div>

                            <p
                                v-if="previewError && url.trim()"
                                class="text-xs text-amber-600 dark:text-amber-400"
                            >
                                {{ t('imageModal.previewError') }}
                            </p>
                        </div>

                        <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-neutral-100 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50">
                            <button
                                type="button"
                                @click="cancel"
                                class="px-4 py-2 text-sm font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                            >
                                {{ t('imageModal.cancel') }}
                            </button>
                            <button
                                type="submit"
                                :disabled="!url.trim()"
                                class="px-4 py-2 text-sm font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800"
                            >
                                {{ t('imageModal.insert') }}
                            </button>
                        </div>
                    </form>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>
