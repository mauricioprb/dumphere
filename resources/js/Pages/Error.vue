<script setup lang="ts">
import { computed } from 'vue';
import { Link } from '@inertiajs/vue3';
import AppLayout from '@/Components/Layout/AppLayout.vue';
import ExternalPageShell from '@/Components/Layout/ExternalPageShell.vue';
import { useI18n } from '@/Composables/useI18n';
import type { TranslationKey } from '@/Composables/useI18n';

const props = withDefaults(
    defineProps<{
        status: number;
        reason?: string | null;
        prefix?: string | null;
        retryAfter?: number | null;
    }>(),
    { reason: null, prefix: null, retryAfter: null },
);

const { t } = useI18n();

const known = [403, 404, 419, 429, 500, 503];

const key = computed(() => props.reason ?? (known.includes(props.status) ? String(props.status) : 'default'));

const title = computed(() => t(`error.${key.value}.title` as TranslationKey));
const body = computed(() => t(`error.${key.value}.body` as TranslationKey));
</script>

<template>
    <AppLayout>
        <ExternalPageShell>
            <div class="relative z-2 grid min-h-[78dvh] place-items-center px-[clamp(1.1rem,3vw,2.75rem)] py-12">
                <div class="w-[min(100%,34rem)]">
                    <p class="font-mono text-xs text-(--external-muted)">{{ status }}</p>

                    <h1 class="mt-3 text-[clamp(1.6rem,5vw,2.4rem)] leading-tight text-(--external-ink)">
                        {{ title }}
                    </h1>

                    <p class="mt-3 text-(--external-muted)">
                        {{ body }}
                        <span v-if="prefix" class="font-mono text-(--external-ink)"
                            ><span class="text-(--external-live)">/</span>{{ prefix }}</span
                        >
                    </p>

                    <p v-if="retryAfter" class="mt-2 font-mono text-sm text-(--external-muted)">
                        {{ t('error.retryAfter', { seconds: retryAfter }) }}
                    </p>

                    <Link href="/" class="external-button mt-8">{{ t('error.back') }}</Link>
                </div>
            </div>
        </ExternalPageShell>
    </AppLayout>
</template>
