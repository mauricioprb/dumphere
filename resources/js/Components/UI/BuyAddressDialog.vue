<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { router } from '@inertiajs/vue3';
import { Check, X } from '@lucide/vue';
import { useI18n } from '@/Composables/useI18n';

const props = defineProps<{ open: boolean; prefix: string; price: string | null }>();
const emit = defineEmits<{ 'update:open': [boolean] }>();

const { t } = useI18n();
const buying = ref(false);
const confirmButton = ref<HTMLButtonElement | null>(null);
let previouslyFocused: HTMLElement | null = null;

const benefits = ['never', 'yours', 'nested', 'readonly', 'password', 'once'] as const;

watch(
    () => props.open,
    (open) => {
        if (open) {
            previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            nextTick(() => confirmButton.value?.focus());
        } else {
            const target = previouslyFocused;
            previouslyFocused = null;
            nextTick(() => target?.focus());
        }
    },
);

function close(): void {
    emit('update:open', false);
}

function buy(): void {
    buying.value = true;
    router.post('/checkout', { prefix: props.prefix }, { onFinish: () => (buying.value = false) });
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
                v-if="open"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
                @click.self="close"
                @keydown.esc="close"
            >
                <Transition
                    appear
                    enter-active-class="transition duration-150 ease-out motion-reduce:transition-none"
                    enter-from-class="opacity-0 scale-95 translate-y-2 motion-reduce:scale-100 motion-reduce:translate-y-0"
                    enter-to-class="opacity-100 scale-100 translate-y-0"
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="buy-address-title"
                        class="editor-dialog w-full max-w-md overflow-hidden rounded-xl"
                    >
                        <header class="flex items-start gap-3 border-b border-(--workspace-rule) px-5 py-4">
                            <div class="flex-1">
                                <h2
                                    id="buy-address-title"
                                    class="font-display text-xl font-medium tracking-tight text-(--workspace-ink)"
                                >
                                    {{ t('buy.title') }}
                                    <span class="workspace-address"
                                        ><span class="workspace-address__slash" aria-hidden="true">/</span
                                        >{{ prefix }}</span
                                    >
                                </h2>
                                <p class="mt-1 text-sm text-(--workspace-muted)">{{ t('buy.subtitle') }}</p>
                            </div>
                            <button
                                type="button"
                                :aria-label="t('ownership.close')"
                                class="editor-focus -mt-1 inline-flex size-11 shrink-0 items-center justify-center rounded-md text-(--workspace-muted) transition-colors hover:bg-(--workspace-panel) hover:text-(--workspace-ink) motion-reduce:transition-none"
                                @click="close"
                            >
                                <X class="h-4 w-4" aria-hidden="true" />
                            </button>
                        </header>

                        <ul class="flex flex-col gap-3 px-5 py-4 text-sm text-(--workspace-ink)">
                            <li v-for="benefit in benefits" :key="benefit" class="flex items-start gap-2.5">
                                <Check class="mt-0.5 size-4 shrink-0 text-(--workspace-live)" aria-hidden="true" />
                                <span>{{ t(`buy.${benefit}`, { prefix }) }}</span>
                            </li>
                        </ul>

                        <footer
                            class="flex items-center justify-between gap-3 border-t border-(--workspace-rule) px-5 py-4"
                        >
                            <p class="font-mono text-xs text-(--workspace-muted)">{{ t('buy.terms') }}</p>
                            <button
                                ref="confirmButton"
                                type="button"
                                :disabled="buying"
                                class="workspace-button"
                                @click="buy"
                            >
                                {{ price ? t('buy.confirmWithPrice', { price }) : t('buy.confirm') }}
                            </button>
                        </footer>
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>
