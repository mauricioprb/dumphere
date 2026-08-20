<script setup lang="ts">
import { useForm } from '@inertiajs/vue3';
import AppLayout from '@/Components/Layout/AppLayout.vue';
import ExternalPageShell from '@/Components/Layout/ExternalPageShell.vue';
import { useI18n } from '@/Composables/useI18n';
import { useAppHost } from '@/Composables/useAppUrl';

const { t } = useI18n();
const appHost = useAppHost();
const form = useForm({ prefix: '', receipt_url: '', password: '', password_confirmation: '' });
</script>

<template>
    <AppLayout>
        <ExternalPageShell>
            <div class="relative z-2 grid min-h-[78dvh] place-items-center px-[clamp(1.1rem,3vw,2.75rem)] py-12">
                <div class="w-[min(100%,32rem)]">
                    <h1 class="text-[clamp(1.5rem,4vw,2rem)] text-(--external-ink)">{{ t('recover.heading') }}</h1>
                    <p class="mt-3 text-(--external-muted)">{{ t('recover.body') }}</p>

                    <form class="mt-8 flex flex-col gap-2" @submit.prevent="form.post('/recover')">
                        <label class="text-sm text-(--external-muted)" for="recover-prefix">
                            {{ t('recover.prefix') }}
                        </label>
                        <div class="flex items-center gap-1 text-(--external-muted)">
                            <span aria-hidden="true" class="shrink-0 font-mono text-sm">{{ appHost }}/</span>
                            <input
                                id="recover-prefix"
                                v-model="form.prefix"
                                type="text"
                                autocapitalize="none"
                                spellcheck="false"
                                required
                                aria-describedby="recover-prefix-hint"
                                class="external-input w-full"
                            />
                        </div>
                        <p id="recover-prefix-hint" class="text-sm text-(--external-muted)">
                            {{ t('recover.prefixHint') }}
                        </p>

                        <label class="mt-4 text-sm text-(--external-muted)" for="recover-receipt">
                            {{ t('recover.receipt') }}
                        </label>
                        <input
                            id="recover-receipt"
                            v-model="form.receipt_url"
                            type="url"
                            placeholder="https://pay.stripe.com/receipts/..."
                            required
                            aria-describedby="recover-receipt-hint"
                            class="external-input"
                        />
                        <p id="recover-receipt-hint" class="text-sm text-(--external-muted)">
                            {{ t('recover.receiptHint') }}
                        </p>
                        <p
                            v-if="form.errors.receipt_url"
                            role="alert"
                            class="text-sm font-semibold text-(--external-error)"
                        >
                            {{ form.errors.receipt_url }}
                        </p>

                        <label class="mt-4 text-sm text-(--external-muted)" for="recover-password">
                            {{ t('recover.newPassword') }}
                        </label>
                        <input
                            id="recover-password"
                            v-model="form.password"
                            type="password"
                            autocomplete="new-password"
                            required
                            class="external-input"
                        />

                        <label class="mt-2 text-sm text-(--external-muted)" for="recover-password-confirm">
                            {{ t('recover.confirmPassword') }}
                        </label>
                        <input
                            id="recover-password-confirm"
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

                        <button type="submit" :disabled="form.processing" class="external-button mt-4">
                            {{ t('recover.submit') }}
                        </button>
                    </form>
                </div>
            </div>
        </ExternalPageShell>
    </AppLayout>
</template>
