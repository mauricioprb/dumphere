<script setup lang="ts">
import { computed, ref } from 'vue';
import DocumentEditor from '@/Views/DocumentEditor.vue';
import DocumentLocked from '@/Views/DocumentLocked.vue';
import ErrorView from '@/Views/ErrorView.vue';
import { callDocuments, readOwnerToken, type ApiFailure } from '@/Composables/useAppwrite';
import { useI18n } from '@/Composables/useI18n';
import type { LockedDocument, OpenedDocument } from '@/types/document';

const route = useRoute();
const { t } = useI18n();
const slug = computed(() => ([route.params.slug].flat() as string[]).join('/').toLowerCase());
const prefix = computed(() => slug.value.split('/')[0] ?? '');
const visitorPassword = ref('');
const unlockError = ref('');

const { data, status, refresh } = await useAsyncData(
    'document',
    () =>
        callDocuments<OpenedDocument | LockedDocument | ApiFailure>('/open', {
            slug: slug.value,
            ownerToken: readOwnerToken(prefix.value),
            visitorPassword: visitorPassword.value || undefined,
        }),
    { watch: [slug] },
);

const opened = computed(() =>
    data.value?.status === 200 && 'document' in data.value.data ? data.value.data : null,
);
const locked = computed(() => {
    const body = data.value?.data;

    if (data.value?.status === 200 && body && 'status' in body && body.status === 'locked')
        return body;
    if (data.value?.status === 422 && visitorPassword.value)
        return { slug: slug.value, ...emptyTheme };

    return null;
});
const failure = computed(() =>
    opened.value || locked.value
        ? null
        : {
              status: data.value?.status ?? 503,
              body: (data.value?.data ?? null) as ApiFailure | null,
          },
);
const emptyTheme = { themeHue: null, themeChroma: null, themeHueDark: null, themeChromaDark: null };

async function unlock(password: string): Promise<void> {
    visitorPassword.value = password;
    unlockError.value = '';
    await refresh();

    if (data.value?.status === 422) unlockError.value = t('locked.wrong');
    if (data.value?.status === 429) unlockError.value = t('ownership.tooMany');
}

useHead(() => ({
    title: `${opened.value?.document.title || slug.value} — Dumphere`,
    meta: [{ name: 'robots', content: 'noindex, nofollow, noarchive, nosnippet, noimageindex' }],
}));
</script>

<template>
    <DocumentEditor
        v-if="opened"
        :document="opened.document"
        :ws-token="opened.wsToken"
        :readonly="opened.readonly"
        :reserved="opened.reserved"
        :max-documents="opened.maxDocuments"
        :is-owner="opened.isOwner"
        :readonly-for-visitors="opened.readonlyForVisitors"
        :locked-for-visitors="opened.lockedForVisitors"
        :theme="opened"
    />
    <DocumentLocked
        v-else-if="locked"
        :slug="locked.slug"
        :theme="locked"
        :error="unlockError"
        :processing="status === 'pending'"
        @unlock="unlock"
    />
    <ErrorView
        v-else-if="failure"
        :status="failure.status"
        :reason="failure.body?.error === 'taken' ? 'taken' : null"
        :prefix="failure.body?.prefix ?? null"
        :retry-after="failure.body?.retryAfter ?? null"
    />
</template>
