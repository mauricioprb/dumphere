import { ref, watch, onUnmounted, type ShallowRef } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { useDocumentStore } from '@/Stores/documentStore'
import type { SaveResponse } from '@/types/document'

export function useAutoSave(editorRef: ShallowRef<Editor | undefined>, slug: string, debounceMs = 5000) {
    const store = useDocumentStore()
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const pendingSave = ref(false)

    function scheduleSave() {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }
        pendingSave.value = true
        timeoutId = setTimeout(() => {
            performSave()
        }, debounceMs)
    }

    async function performSave() {
        if (!editorRef.value) return

        const content = editorRef.value.getHTML()

        if (!content || content === '<p></p>') {
            pendingSave.value = false
            return
        }

        store.setSaving(true)

        try {
            const response = await fetch(`/${slug}/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCSRFToken(),
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    markdownContent: content,
                    yjsStateBase64: null,
                }),
            })

            const data: SaveResponse = await response.json()

            if (data.success && data.updatedAt) {
                store.setSavedAt(data.updatedAt)
            } else if (data.error) {
                store.setError(data.error)
            }
        } catch (err) {
            console.error('[AutoSave] Failed to save:', err)
            store.setError('Failed to save. Will retry...')
            setTimeout(() => scheduleSave(), 10000)
        } finally {
            store.setSaving(false)
            pendingSave.value = false
        }
    }

    function saveNow() {
        if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
        }
        performSave()
    }

    const handleBeforeUnload = () => {
        if (pendingSave.value) {
            saveNow()
        }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    onUnmounted(() => {
        if (timeoutId) clearTimeout(timeoutId)
        window.removeEventListener('beforeunload', handleBeforeUnload)
    })

    return {
        scheduleSave,
        saveNow,
        pendingSave,
    }
}

function getCSRFToken(): string {
    const meta = document.querySelector('meta[name="csrf-token"]')
    return meta?.getAttribute('content') ?? ''
}
