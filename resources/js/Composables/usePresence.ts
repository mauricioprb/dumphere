import { computed } from 'vue'
import { useDocumentStore } from '@/Stores/documentStore'
import type { PresenceUser } from '@/types/document'

export function usePresence() {
    const store = useDocumentStore()

    const users = computed<PresenceUser[]>(() => store.connectedUsers)
    const userCount = computed(() => store.userCount)
    const isConnected = computed(() => store.isConnected)

    return {
        users,
        userCount,
        isConnected,
    }
}
