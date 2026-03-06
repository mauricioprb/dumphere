import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DocumentData, PresenceUser } from '@/types/document'

export const useDocumentStore = defineStore('document', () => {
    const document = ref<DocumentData | null>(null)
    const connectedUsers = ref<PresenceUser[]>([])
    const isConnected = ref(false)
    const isSaving = ref(false)
    const lastSavedAt = ref<string | null>(null)
    const error = ref<string | null>(null)

    const slug = computed(() => document.value?.slug ?? '')
    const title = computed(() => document.value?.title ?? 'Untitled')
    const userCount = computed(() => connectedUsers.value.length)

    function setDocument(doc: DocumentData) {
        document.value = doc
        lastSavedAt.value = doc.updatedAt
    }

    function setConnected(connected: boolean) {
        isConnected.value = connected
    }

    function setSaving(saving: boolean) {
        isSaving.value = saving
    }

    function setSavedAt(timestamp: string) {
        lastSavedAt.value = timestamp
        error.value = null
    }

    function setError(err: string) {
        error.value = err
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
        isSaving,
        lastSavedAt,
        error,
        slug,
        title,
        userCount,
        setDocument,
        setConnected,
        setSaving,
        setSavedAt,
        setError,
        addUser,
        removeUser,
        setUsers,
    }
})
