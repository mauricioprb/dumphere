<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '@/Composables/useI18n'
import { X } from '@lucide/vue'

const props = defineProps<{
    slug: string
    createdAt: string
}>()

const { t } = useI18n()
const isOldEnough = computed(() => {
    const ageMs = Date.now() - new Date(props.createdAt).getTime()
    const ageDays = ageMs / (1000 * 60 * 60 * 24)
    return ageDays >= 1
})

const storageKey = computed(() => `expiration-dismissed:${props.slug}`)
const dismissed = ref(
    typeof sessionStorage !== 'undefined'
        && sessionStorage.getItem(storageKey.value) === '1'
)

function dismiss() {
    sessionStorage.setItem(storageKey.value, '1')
    dismissed.value = true
}
</script>

<template>
    <div
        v-if="!dismissed && isOldEnough"
        role="status"
        class="flex items-center justify-between gap-3 px-4 py-2 text-xs border-t border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-300"
    >
        <span>{{ t('expiration.notice') }}</span>
        <button
            type="button"
            :aria-label="t('expiration.dismiss')"
            class="shrink-0 rounded p-0.5 hover:bg-amber-200 dark:hover:bg-amber-800/40 transition-colors focus-visible:outline focus-visible:outline-amber-500"
            @click="dismiss"
        >
            <X class="w-3.5 h-3.5" aria-hidden="true" />
        </button>
    </div>
</template>
