<script setup lang="ts">
import { Link, useForm } from '@inertiajs/vue3';
import AppLayout from '@/Components/Layout/AppLayout.vue';
import ExternalPageShell from '@/Components/Layout/ExternalPageShell.vue';
import { useI18n } from '@/Composables/useI18n';

const props = defineProps<{ prefix: string; sessionId: string; alreadyClaimed: boolean }>();

const { t } = useI18n();
const form = useForm({ session_id: props.sessionId, password: '', password_confirmation: '' });
</script>

<template>
    <AppLayout>
        <ExternalPageShell>
            <div class="relative z-2 grid min-h-[78dvh] place-items-center px-[clamp(1.1rem,3vw,2.75rem)] py-12">
                <div class="w-[min(100%,32rem)]">
                    <h1 class="text-[clamp(1.5rem,4vw,2rem)] text-(--external-ink)">
                        {{ t('claim.heading', { prefix }) }}
                    </h1>

                    <template v-if="alreadyClaimed">
                        <p class="mt-3 text-(--external-muted)">{{ t('claim.alreadyClaimed') }}</p>
                        <Link :href="`/${prefix}`" class="external-button mt-6">{{ t('claim.toManage') }}</Link>
                    </template>

                    <template v-else>
                        <p class="mt-3 text-(--external-muted)">{{ t('claim.body') }}</p>

                        <form class="mt-8 flex flex-col gap-2" @submit.prevent="form.post('/claim')">
                            <label class="text-sm text-(--external-muted)" for="owner-password">
                                {{ t('claim.label') }}
                            </label>
                            <input
                                id="owner-password"
                                v-model="form.password"
                                type="password"
                                autocomplete="new-password"
                                required
                                class="external-input"
                            />

                            <label class="mt-2 text-sm text-(--external-muted)" for="owner-password-confirm">
                                {{ t('claim.confirmLabel') }}
                            </label>
                            <input
                                id="owner-password-confirm"
                                v-model="form.password_confirmation"
                                type="password"
                                autocomplete="new-password"
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
                            <p class="mt-2 text-sm text-(--external-muted)">{{ t('claim.recoveryHint') }}</p>
                            <button type="submit" :disabled="form.processing" class="external-button mt-2">
                                {{ t('claim.submit') }}
                            </button>
                        </form>
                    </template>
                </div>
            </div>
        </ExternalPageShell>
    </AppLayout>
</template>
