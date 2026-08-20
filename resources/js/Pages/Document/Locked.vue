<script setup lang="ts">
import { useForm } from '@inertiajs/vue3';
import AppLayout from '@/Components/Layout/AppLayout.vue';
import ExternalPageShell from '@/Components/Layout/ExternalPageShell.vue';
import { useI18n } from '@/Composables/useI18n';

const props = defineProps<{ slug: string }>();

const { t } = useI18n();
const form = useForm({ password: '' });

function submit(): void {
    form.post(`/${props.slug}`, { preserveScroll: true, preserveState: false });
}
</script>

<template>
    <AppLayout>
        <ExternalPageShell>
            <div class="relative z-2 grid min-h-[78dvh] place-items-center px-[clamp(1.1rem,3vw,2.75rem)] py-12">
                <div class="w-[min(100%,28rem)]">
                    <h1 class="text-[clamp(1.5rem,4vw,2rem)] text-(--external-ink)">{{ t('locked.heading') }}</h1>
                    <p class="mt-3 text-(--external-muted)">{{ t('locked.body', { slug }) }}</p>

                    <form class="mt-8 flex flex-col gap-2" @submit.prevent="submit">
                        <label class="text-sm text-(--external-muted)" for="visitor-password">
                            {{ t('locked.label') }}
                        </label>
                        <input
                            id="visitor-password"
                            v-model="form.password"
                            type="password"
                            autocomplete="current-password"
                            required
                            class="external-input"
                        />
                        <p
                            v-if="form.errors.password"
                            role="alert"
                            class="text-sm font-semibold text-(--external-error)"
                        >
                            {{ form.errors.password }}
                        </p>
                        <button type="submit" :disabled="form.processing" class="external-button mt-2">
                            {{ t('locked.submit') }}
                        </button>
                    </form>
                </div>
            </div>
        </ExternalPageShell>
    </AppLayout>
</template>
