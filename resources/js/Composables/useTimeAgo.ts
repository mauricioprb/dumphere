import { ref, watch, onUnmounted, type Ref } from 'vue'
import { useI18n, type TranslationKey } from '@/Composables/useI18n'

export type TimeAgoResult = {
    key: string
    count: number
}

export function useTimeAgo(timestamp: Ref<string | null>, intervalMs = 10_000) {
    const { t } = useI18n()
    const timeAgo = ref<string | null>(null)
    let timer: ReturnType<typeof setInterval> | null = null

    function format(key: TranslationKey, count: number): string {
        return t(key, { count })
    }

    function update() {
        if (!timestamp.value) {
            timeAgo.value = null
            return
        }

        const savedDate = new Date(timestamp.value)
        const now = new Date()
        const diffMs = now.getTime() - savedDate.getTime()
        const diffSec = Math.floor(diffMs / 1000)

        if (diffSec < 5) {
            timeAgo.value = t('time.now')
        } else if (diffSec < 60) {
            timeAgo.value = format('time.seconds', diffSec)
        } else if (diffSec < 3600) {
            const mins = Math.floor(diffSec / 60)
            timeAgo.value = format('time.minutes', mins)
        } else if (diffSec < 86400) {
            const hours = Math.floor(diffSec / 3600)
            timeAgo.value = format('time.hours', hours)
        } else {
            const days = Math.floor(diffSec / 86400)
            timeAgo.value = format('time.days', days)
        }
    }

    watch(timestamp, () => {
        update()
    }, { immediate: true })

    timer = setInterval(update, intervalMs)

    onUnmounted(() => {
        if (timer) clearInterval(timer)
    })

    return timeAgo
}
