<script setup lang="ts">
import { computed, ref, watch, nextTick, onUnmounted } from 'vue';
import { ImageIcon, X } from '@lucide/vue';
import { useImageModal } from '@/Composables/useImageModal';
import { useI18n } from '@/Composables/useI18n';
import { normalizeImageUrl } from '@/Lib/imageUrl';

const { isOpen, confirm, cancel } = useImageModal();
const { t } = useI18n();

const url = ref('');
const alt = ref('');
const urlInput = ref<HTMLInputElement | null>(null);
const dialogRef = ref<HTMLElement | null>(null);
const previewError = ref(false);
const previewLoaded = ref(false);
const invalidUrl = ref(false);
const previewUrl = computed(() => normalizeImageUrl(url.value));
let previouslyFocused: HTMLElement | null = null;

watch(isOpen, (open) => {
    if (open) {
        previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        url.value = '';
        alt.value = '';
        previewError.value = false;
        previewLoaded.value = false;
        invalidUrl.value = false;
        document.getElementById('app')?.setAttribute('inert', '');
        nextTick(() => urlInput.value?.focus());
    } else {
        const focusTarget = previouslyFocused;
        previouslyFocused = null;
        document.getElementById('app')?.removeAttribute('inert');
        nextTick(() => focusTarget?.focus());
    }
});

onUnmounted(() => {
    document.getElementById('app')?.removeAttribute('inert');
});

watch(url, () => {
    previewError.value = false;
    previewLoaded.value = false;
    invalidUrl.value = false;
});

function onSubmit() {
    const src = normalizeImageUrl(url.value);
    if (!src) {
        invalidUrl.value = true;
        urlInput.value?.focus();
        return;
    }

    confirm({ src, alt: alt.value.trim() });
}

function onOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) cancel();
}

function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
        cancel();
        return;
    }

    if (e.key !== 'Tab') return;

    const focusable = Array.from(
        dialogRef.value?.querySelectorAll<HTMLElement>(
            'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
    }
}
</script>

<template>
    <Teleport to="body">
        <Transition
            enter-active-class="transition duration-150 ease-out motion-reduce:transition-none"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition duration-100 ease-in motion-reduce:transition-none"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div
                v-if="isOpen"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
                @click="onOverlayClick"
                @keydown="onKeydown"
            >
                <Transition
                    enter-active-class="transition duration-150 ease-out motion-reduce:transition-none"
                    enter-from-class="opacity-0 scale-95 translate-y-2 motion-reduce:scale-100 motion-reduce:translate-y-0"
                    enter-to-class="opacity-100 scale-100 translate-y-0"
                    leave-active-class="transition duration-100 ease-in motion-reduce:transition-none"
                    leave-from-class="opacity-100 scale-100 translate-y-0"
                    leave-to-class="opacity-0 scale-95 translate-y-2 motion-reduce:scale-100 motion-reduce:translate-y-0"
                >
                    <div
                        v-if="isOpen"
                        ref="dialogRef"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="image-modal-title"
                        class="editor-dialog w-full max-w-md overflow-hidden rounded-xl"
                    >
                        <form @submit.prevent="onSubmit">
                            <div class="flex items-center gap-3 border-b border-(--workspace-rule) px-5 py-3">
                                <ImageIcon class="size-5 shrink-0 text-(--workspace-accent)" aria-hidden="true" />
                                <h2
                                    id="image-modal-title"
                                    class="flex-1 font-display text-xl font-medium tracking-tight text-(--workspace-ink)"
                                >
                                    {{ t('imageModal.title') }}
                                </h2>
                                <button
                                    type="button"
                                    :aria-label="t('imageModal.close')"
                                    class="editor-focus inline-flex size-11 items-center justify-center rounded-md text-(--workspace-muted) transition-colors hover:bg-(--workspace-panel) hover:text-(--workspace-ink) motion-reduce:transition-none"
                                    @click="cancel"
                                >
                                    <X class="h-4 w-4" aria-hidden="true" />
                                </button>
                            </div>

                            <div class="space-y-4 px-5 py-4">
                                <div class="space-y-1.5">
                                    <label for="image-url" class="block text-sm font-medium text-(--workspace-ink)">
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
                                        class="editor-field min-h-11 w-full rounded-md px-3 py-2 text-base sm:text-sm"
                                        required
                                    />
                                    <p
                                        v-if="invalidUrl"
                                        id="image-url-error"
                                        class="text-sm text-(--workspace-danger)"
                                        role="alert"
                                    >
                                        {{ t('imageModal.invalidUrl') }}
                                    </p>
                                </div>

                                <div class="space-y-1.5">
                                    <label for="image-alt" class="block text-sm font-medium text-(--workspace-ink)">
                                        {{ t('imageModal.altLabel') }}
                                    </label>
                                    <input
                                        id="image-alt"
                                        v-model="alt"
                                        type="text"
                                        :placeholder="t('imageModal.altPlaceholder')"
                                        aria-describedby="image-alt-help"
                                        class="editor-field min-h-11 w-full rounded-md px-3 py-2 text-base sm:text-sm"
                                    />
                                    <p id="image-alt-help" class="text-xs leading-relaxed text-(--workspace-muted)">
                                        {{ t('imageModal.altHelp') }}
                                    </p>
                                </div>

                                <div v-if="previewUrl && !previewError" class="space-y-1.5">
                                    <span class="block text-sm font-medium text-(--workspace-ink)">
                                        {{ t('imageModal.preview') }}
                                    </span>
                                    <div
                                        class="editor-preview flex max-h-50 min-h-20 items-center justify-center overflow-hidden rounded-md p-2"
                                    >
                                        <img
                                            :src="previewUrl"
                                            :alt="alt || ''"
                                            class="max-h-45 max-w-full rounded object-contain"
                                            @load="previewLoaded = true"
                                            @error="previewError = true"
                                        />
                                        <span
                                            v-if="!previewLoaded && !previewError"
                                            class="text-xs text-(--workspace-muted)"
                                            role="status"
                                        >
                                            {{ t('imageModal.loading') }}
                                        </span>
                                    </div>
                                </div>

                                <p
                                    v-if="previewError && url.trim()"
                                    class="text-sm text-(--workspace-warning)"
                                    role="status"
                                >
                                    {{ t('imageModal.previewError') }}
                                </p>
                            </div>

                            <div
                                class="flex items-center justify-end gap-2 border-t border-(--workspace-rule) px-5 py-3"
                            >
                                <button
                                    type="button"
                                    class="editor-focus min-h-11 rounded-md px-4 py-2 text-sm font-medium text-(--workspace-muted) transition-colors hover:bg-(--workspace-panel) hover:text-(--workspace-ink) motion-reduce:transition-none"
                                    @click="cancel"
                                >
                                    {{ t('imageModal.cancel') }}
                                </button>
                                <button
                                    type="submit"
                                    :disabled="!url.trim()"
                                    class="editor-focus min-h-11 rounded-md bg-(--workspace-ink) px-4 py-2 text-sm font-semibold text-(--workspace-paper) transition-colors hover:bg-(--workspace-live) hover:text-(--workspace-live-ink) disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
                                >
                                    {{ t('imageModal.insert') }}
                                </button>
                            </div>
                        </form>
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>
