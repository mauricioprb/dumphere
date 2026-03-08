import { ref } from 'vue'

export interface ImageInsertData {
    src: string
    alt: string
}

type ResolveCallback = (data: ImageInsertData | null) => void

const isOpen = ref(false)
const resolveCallback = ref<ResolveCallback | null>(null)

export function useImageModal() {
    function open(): Promise<ImageInsertData | null> {
        isOpen.value = true
        return new Promise<ImageInsertData | null>((resolve) => {
            resolveCallback.value = resolve
        })
    }

    function confirm(data: ImageInsertData) {
        resolveCallback.value?.(data)
        resolveCallback.value = null
        isOpen.value = false
    }

    function cancel() {
        resolveCallback.value?.(null)
        resolveCallback.value = null
        isOpen.value = false
    }

    return { isOpen, open, confirm, cancel }
}
