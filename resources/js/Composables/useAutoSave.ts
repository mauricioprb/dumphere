import { onUnmounted, type ShallowRef } from 'vue'
import { router } from '@inertiajs/vue3'
import type { Editor } from '@tiptap/vue-3'
import { useDocumentStore } from '@/Stores/documentStore'
import type { SaveResponse } from '@/types/document'
import { getPersistableHtml } from '@/Lib/editorContent'

export function useAutoSave(
    editorRef: ShallowRef<Editor | undefined>,
    slug: string,
    debounceMs = 1500,
    beforeRead?: () => void,
) {
    const store = useDocumentStore()

    let debounceTimer: ReturnType<typeof setTimeout> | null = null
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let savingInFlight = false
    let dirty = false
    const minSavingDisplayMs = 250
    const maxRetryMs = 30_000
    let currentRetryMs = 5_000

    function onEditorUpdate() {
        dirty = true
        store.markDirty()
        scheduleDebounce()
    }

    function scheduleDebounce() {
        if (debounceTimer) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
            debounceTimer = null
            performSave()
        }, debounceMs)
    }

    async function performSave() {
        const ed = editorRef.value
        if (!ed || savingInFlight) return

        beforeRead?.()
        const contentHtml = getPersistableHtml(ed)

        savingInFlight = true
        dirty = false
        store.markSaving()
        const saveStartedAt = Date.now()

        try {
            const response = await fetch(`/${slug}/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCSRFToken(),
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    contentHtml,
                }),
            })

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`)
            }

            const data: SaveResponse = await response.json()

            if (data.success && data.updatedAt) {
                // Ensure "Saving…" is visible long enough
                const elapsed = Date.now() - saveStartedAt
                const remaining = minSavingDisplayMs - elapsed
                if (remaining > 0) {
                    await delay(remaining)
                }

                store.markSaved(data.updatedAt)
                currentRetryMs = 5_000
            } else {
                throw new Error(data.error ?? 'Unknown save error')
            }
        } catch (err) {
            console.error('[AutoSave] Failed:', err)
            store.markError('Falha ao salvar. Tentando novamente…')
            retryTimer = setTimeout(() => {
                retryTimer = null
                performSave()
            }, currentRetryMs)
            currentRetryMs = Math.min(currentRetryMs * 2, maxRetryMs)
        } finally {
            savingInFlight = false
            if (dirty) {
                scheduleDebounce()
            }
        }
    }

    function persistLatestOnExit() {
        if (!dirty && store.saveStatus !== 'dirty') return

        if (debounceTimer) {
            clearTimeout(debounceTimer)
            debounceTimer = null
        }

        const ed = editorRef.value
        if (!ed) return
        beforeRead?.()
        const contentHtml = getPersistableHtml(ed)
        dirty = false

        fetch(`/${slug}/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCSRFToken(),
                'Accept': 'application/json',
            },
            body: JSON.stringify({ contentHtml }),
            keepalive: true,
        }).catch(() => {})
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
        if (!dirty && store.saveStatus !== 'dirty') return

        event.preventDefault()
        persistLatestOnExit()
    }

    const removeInertiaListener = router.on('before', (event) => {
        if (event.detail.visit.prefetch) return

        persistLatestOnExit()
    })

    window.addEventListener('beforeunload', handleBeforeUnload)

    onUnmounted(() => {
        persistLatestOnExit()
        if (debounceTimer) clearTimeout(debounceTimer)
        if (retryTimer) clearTimeout(retryTimer)
        removeInertiaListener()
        window.removeEventListener('beforeunload', handleBeforeUnload)
    })

    return {
        onEditorUpdate,
    }
}

function getCSRFToken(): string {
    const meta = document.querySelector('meta[name="csrf-token"]')
    return meta?.getAttribute('content') ?? ''
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
