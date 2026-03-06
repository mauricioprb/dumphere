import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DocumentData, PresenceUser } from '@/types/document'

export type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'

export const useDocumentStore = defineStore('document', () => {
    const document = ref<DocumentData | null>(null)
    const connectedUsers = ref<PresenceUser[]>([])
    const isConnected = ref(false)
    const saveStatus = ref<SaveStatus>('idle')
    const lastSavedAt = ref<string | null>(null)
    const saveError = ref<string | null>(null)

    const slug = computed(() => document.value?.slug ?? '')
    const title = computed(() => document.value?.title ?? 'Untitled')
    const userCount = computed(() => connectedUsers.value.length)

    function setDocument(doc: DocumentData) {
        document.value = doc
        lastSavedAt.value = doc.updatedAt
        if (doc.updatedAt) {
            saveStatus.value = 'saved'
        }
    }

    function setConnected(connected: boolean) {
        isConnected.value = connected
    }

    function markDirty() {
        if (saveStatus.value !== 'saving') {
            saveStatus.value = 'dirty'
        }
    }

    function markSaving() {
        saveStatus.value = 'saving'
        saveError.value = null
    }

    function markSaved(timestamp: string) {
        lastSavedAt.value = timestamp
        saveStatus.value = 'saved'
        saveError.value = null
    }

    function markError(err: string) {
        saveStatus.value = 'error'
        saveError.value = err
    }

    function addUser(user: PresenceUser) {
        if (!connectedUsers.value.find(u => u.id === user.id)) {
            connectedUsers.value.push(user)
        }
    }

    function removeUser(userId: string) {
        connectedUsers.value = connectedUsers.value.filter(u => u.id !== userId)
    }

    function setUsers(users: PresenceUser[]) {
        connectedUsers.value = users
    }

    return {
        document,
        connectedUsers,
        isConnected,
        saveStatus,
        lastSavedAt,
        saveError,
        slug,
        title,
        userCount,
        setDocument,
        setConnected,
        markDirty,
        markSaving,
        markSaved,
        markError,
        addUser,
        removeUser,
        setUsers,
    }
})
