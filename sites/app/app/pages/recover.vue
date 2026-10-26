<script setup lang="ts">
import { reactive, ref } from 'vue';
import AppLayout from '@/Components/Layout/AppLayout.vue';
import ExternalPageShell from '@/Components/Layout/ExternalPageShell.vue';
import { useI18n } from '@/Composables/useI18n';
import { useAppHost } from '@/Composables/useAppUrl';
import { callDocuments, storeOwnerToken, type ApiFailure } from '@/Composables/useAppwrite';

const { t } = useI18n();
const appHost = useAppHost();

const form = reactive({ prefix: '', recoveryKey: '', password: '', passwordConfirmation: '' });
const errors = reactive({ recoveryKey: '', password: '' });
const processing = ref(false);

const failures: Record<string, () => void> = {
    recoveryKeyMismatch: () => (errors.recoveryKey = t('recover.keyMismatch')),
    passwordMismatch: () => (errors.password = t('recover.passwordMismatch')),
    invalidPassword: () => (errors.password = t('recover.passwordInvalid')),
    tooManyAttempts: () => (errors.recoveryKey = t('ownership.tooMany')),
};

async function submit(): Promise<void> {
    processing.value = true;
    errors.recoveryKey = '';
    errors.password = '';

    try {
        const { status, data } = await callDocuments<
            { prefix: string; ownerToken: string } | ApiFailure
        >('/recover', form);

        if (status === 200 && 'ownerToken' in data) {
            storeOwnerToken(data.prefix, data.ownerToken);
            await navigateTo(`/${data.prefix}`);
            return;
        }

        (
            failures[(data as ApiFailure | null)?.error ?? ''] ??
            (() => (errors.recoveryKey = t('ownership.failed')))
        )();
    } catch {
        errors.recoveryKey = t('ownership.failed');
    } finally {
        processing.value = false;
    }
}
</script>

<template>
    <AppLayout>
        <ExternalPageShell>
            <div
                class="relative z-2 grid min-h-[78dvh] place-items-center px-[clamp(1.1rem,3vw,2.75rem)] py-12"
            >
                <div class="w-[min(100%,32rem)]">
                    <h1 class="text-[clamp(1.5rem,4vw,2rem)] text-(--external-ink)">
                        {{ t('recover.heading') }}
                    </h1>
                    <p class="mt-3 text-(--external-muted)">{{ t('recover.body') }}</p>

                    <form class="mt-8 flex flex-col gap-2" @submit.prevent="submit">
                        <label class="text-sm text-(--external-muted)" for="recover-prefix">
                            {{ t('recover.prefix') }}
                        </label>
                        <div class="flex items-center gap-1 text-(--external-muted)">
                            <span aria-hidden="true" class="shrink-0 font-mono text-sm"
                                >{{ appHost }}/</span
                            >
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

                        <label class="mt-4 text-sm text-(--external-muted)" for="recover-key">
                            {{ t('recover.recoveryKey') }}
                        </label>
                        <input
                            id="recover-key"
                            v-model="form.recoveryKey"
                            type="text"
                            autocomplete="off"
                            required
                            aria-describedby="recover-key-hint"
                            class="external-input font-mono"
                        />
                        <p id="recover-key-hint" class="text-sm text-(--external-muted)">
                            {{ t('recover.recoveryKeyHint') }}
                        </p>
                        <p
                            v-if="errors.recoveryKey"
                            role="alert"
                            class="text-sm font-semibold text-(--external-error)"
                        >
                            {{ errors.recoveryKey }}
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

                        <label
                            class="mt-2 text-sm text-(--external-muted)"
                            for="recover-password-confirm"
                        >
                            {{ t('recover.confirmPassword') }}
                        </label>
                        <input
                            id="recover-password-confirm"
                            v-model="form.passwordConfirmation"
                            type="password"
                            autocomplete="new-password"
                            required
                            class="external-input"
                        />
                        <p
                            v-if="errors.password"
                            role="alert"
                            class="text-sm font-semibold text-(--external-error)"
                        >
                            {{ errors.password }}
                        </p>

                        <button type="submit" :disabled="processing" class="external-button mt-4">
                            {{ t('recover.submit') }}
                        </button>
                    </form>
                </div>
            </div>
        </ExternalPageShell>
    </AppLayout>
</template>
