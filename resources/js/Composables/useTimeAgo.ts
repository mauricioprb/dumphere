import { ref, watch, onUnmounted, type Ref } from 'vue'
import { useI18n, type TranslationKey } from '@/Composables/useI18n'


export function useTimeAgo(timestamp: Ref<string | null>) {
    const { t } = useI18n()
    const timeAgo = ref<string | null>(null)
    let timer: ReturnType<typeof setTimeout> | null = null

    function fmt(key: TranslationKey, count: number): string {
        return t(key, { count })
    }

    function update() {
        if (!timestamp.value) {
            timeAgo.value = null
            scheduleNext(10_000)
            return
        }

        const diffSec = Math.floor(
            (Date.now() - new Date(timestamp.value).getTime()) / 1000,
        )

        if (diffSec < 10) {
            timeAgo.value = t('time.now')
            scheduleNext(10_000)
        } else if (diffSec < 60) {
            timeAgo.value = fmt('time.seconds', diffSec)
            scheduleNext(10_000)
        } else if (diffSec < 3600) {
            timeAgo.value = fmt('time.minutes', Math.floor(diffSec / 60))
            scheduleNext(30_000)
        } else if (diffSec < 86400) {
            timeAgo.value = fmt('time.hours', Math.floor(diffSec / 3600))
            scheduleNext(60_000)
        } else {
            timeAgo.value = fmt('time.days', Math.floor(diffSec / 86400))
            scheduleNext(60_000)
        }
    }

    function scheduleNext(ms: number) {
        if (timer) clearTimeout(timer)
        timer = setTimeout(update, ms)
    }

    // Re-run immediately whenever the source timestamp changes
    watch(timestamp, () => update(), { immediate: true })

    onUnmounted(() => {
        if (timer) clearTimeout(timer)
    })

    return timeAgo
}
