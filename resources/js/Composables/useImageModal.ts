import { ref } from 'vue'

export interface ImageInsertData {
    src: string
    alt: string
}

type ResolveCallback = (data: ImageInsertData | null) => void

const isOpen = ref(false)
const resolveCallback = ref<ResolveCallback | null>(null)
let triggerElement: HTMLElement | null = null

export function useImageModal() {
    function open(): Promise<ImageInsertData | null> {
        triggerElement = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null
        isOpen.value = true
        return new Promise<ImageInsertData | null>((resolve) => {
            resolveCallback.value = resolve
        })
    }

    function restoreFocus() {
        setTimeout(() => {
            triggerElement?.focus()
            triggerElement = null
        }, 0)
    }

    function confirm(data: ImageInsertData) {
        resolveCallback.value?.(data)
        resolveCallback.value = null
        isOpen.value = false
        restoreFocus()
    }

    function cancel() {
        resolveCallback.value?.(null)
        resolveCallback.value = null
        isOpen.value = false
        restoreFocus()
    }

    return { isOpen, open, confirm, cancel }
}
