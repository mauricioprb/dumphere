import { onUnmounted, type Ref, type ShallowRef } from 'vue';
import type { Editor } from '@tiptap/vue-3';
import { useDocumentStore } from '@/Stores/documentStore';
import type { SaveResponse } from '@/types/document';
import { getPersistableHtml } from '@/Lib/editorContent';
import { isPermanentSaveRejection } from '@/Lib/saveRetry';
import { useI18n } from '@/Composables/useI18n';
import { callDocuments, readOwnerToken, sendDocumentsBeacon } from '@/Composables/useAppwrite';

export function useAutoSave(
    editorRef: ShallowRef<Editor | undefined>,
    slug: string,
    wsToken: Ref<string>,
    debounceMs = 1500,
    beforeRead?: () => void,
) {
    const store = useDocumentStore();
    const { t } = useI18n();

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let savingInFlight = false;
    let dirty = false;
    const minSavingDisplayMs = 250;
    const maxRetryMs = 30_000;
    let currentRetryMs = 5_000;

    function onEditorUpdate() {
        dirty = true;
        store.markDirty();
        scheduleDebounce();
    }

    function scheduleDebounce() {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            debounceTimer = null;
            performSave();
        }, debounceMs);
    }

    async function performSave() {
        const ed = editorRef.value;
        if (!ed || savingInFlight) return;

        beforeRead?.();
        const contentHtml = getPersistableHtml(ed);

        savingInFlight = true;
        dirty = false;
        store.markSaving();
        const saveStartedAt = Date.now();

        try {
            const { status, data } = await callDocuments<SaveResponse>(
                '/save',
                saveBody(contentHtml),
            );

            if (status !== 200) {
                throw new SaveFailure(status);
            }

            if (data.success && data.updatedAt) {
                const elapsed = Date.now() - saveStartedAt;
                const remaining = minSavingDisplayMs - elapsed;
                if (remaining > 0) {
                    await delay(remaining);
                }

                store.markSaved(data.updatedAt);
                currentRetryMs = 5_000;
            } else {
                throw new Error(data.error ?? 'Unknown save error');
            }
        } catch (err) {
            console.error('[AutoSave] Failed:', err);

            const status = err instanceof SaveFailure ? err.status : null;

            if (status !== null && isPermanentSaveRejection(status)) {
                store.markError(status === 413 ? t('status.tooLarge') : t('status.failedToSave'));
            } else {
                store.markError(t('status.failedToSave'));
                retryTimer = setTimeout(() => {
                    retryTimer = null;
                    performSave();
                }, currentRetryMs);
                currentRetryMs = Math.min(currentRetryMs * 2, maxRetryMs);
            }
        } finally {
            savingInFlight = false;
            if (dirty) {
                scheduleDebounce();
            }
        }
    }

    function persistLatestOnExit() {
        if (!dirty && store.saveStatus !== 'dirty') return;

        if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }

        const ed = editorRef.value;
        if (!ed) return;
        beforeRead?.();
        const contentHtml = getPersistableHtml(ed);
        dirty = false;

        sendDocumentsBeacon('/save', saveBody(contentHtml));
    }

    function saveBody(contentHtml: string) {
        return {
            slug,
            contentHtml,
            wsToken: wsToken.value,
            ownerToken: readOwnerToken(slug.split('/')[0]),
        };
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
        if (!dirty && store.saveStatus !== 'dirty') return;

        event.preventDefault();
        persistLatestOnExit();
    }

    const removeRouteListener = useRouter().beforeEach(() => {
        persistLatestOnExit();
    });

    window.addEventListener('beforeunload', handleBeforeUnload);

    onUnmounted(() => {
        persistLatestOnExit();
        if (debounceTimer) clearTimeout(debounceTimer);
        if (retryTimer) clearTimeout(retryTimer);
        removeRouteListener();
        window.removeEventListener('beforeunload', handleBeforeUnload);
    });

    return {
        onEditorUpdate,
    };
}

class SaveFailure extends Error {
    constructor(readonly status: number) {
        super(`HTTP ${status}`);
    }
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
