import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { DocumentData, PresenceUser } from '@/types/document';

export type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

export const useDocumentStore = defineStore('document', () => {
    const document = ref<DocumentData | null>(null);
    const connectedUsers = ref<PresenceUser[]>([]);
    const isConnected = ref(false);
    const saveStatus = ref<SaveStatus>('idle');
    const lastSavedAt = ref<string | null>(null);
    const saveError = ref<string | null>(null);

    const userCount = computed(() => connectedUsers.value.length);

    function setDocument(doc: DocumentData) {
        const changedDocument = document.value?.id !== doc.id;

        document.value = doc;
        lastSavedAt.value = doc.updatedAt;
        saveStatus.value = doc.updatedAt ? 'saved' : 'idle';
        saveError.value = null;

        if (changedDocument) {
            connectedUsers.value = [];
            isConnected.value = false;
        }
    }

    function setConnected(connected: boolean) {
        isConnected.value = connected;
    }

    function markDirty() {
        if (saveStatus.value !== 'saving') {
            saveStatus.value = 'dirty';
        }
    }

    function markSaving() {
        saveStatus.value = 'saving';
        saveError.value = null;
    }

    function markSaved(timestamp: string) {
        lastSavedAt.value = timestamp;
        saveStatus.value = 'saved';
        saveError.value = null;
    }

    function markError(err: string) {
        saveStatus.value = 'error';
        saveError.value = err;
    }

    function setUsers(users: PresenceUser[]) {
        connectedUsers.value = users;
    }

    return {
        document,
        connectedUsers,
        isConnected,
        saveStatus,
        lastSavedAt,
        saveError,
        userCount,
        setDocument,
        setConnected,
        markDirty,
        markSaving,
        markSaved,
        markError,
        setUsers,
    };
});
