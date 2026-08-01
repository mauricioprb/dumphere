<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from '@/Composables/useI18n';
import { X } from '@lucide/vue';

const props = defineProps<{
    slug: string;
    createdAt: string;
}>();

const { t } = useI18n();
const isOldEnough = computed(() => {
    const ageMs = Date.now() - new Date(props.createdAt).getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    return ageDays >= 1;
});

const storageKey = computed(() => `expiration-dismissed:${props.slug}`);
const dismissed = ref(typeof sessionStorage !== 'undefined' && sessionStorage.getItem(storageKey.value) === '1');

function dismiss() {
    sessionStorage.setItem(storageKey.value, '1');
    dismissed.value = true;
}
</script>

<template>
    <div
        v-if="!dismissed && isOldEnough"
        role="status"
        class="editor-expiration flex items-center justify-between gap-3 border-t border-(--workspace-rule) px-[clamp(0.75rem,2vw,1.5rem)] text-[0.8rem] leading-relaxed text-(--workspace-warning)"
    >
        <span>{{ t('expiration.notice') }}</span>
        <button
            type="button"
            :aria-label="t('expiration.dismiss')"
            class="editor-focus inline-flex size-11 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-(--workspace-panel) hover:text-(--workspace-ink) focus:outline-none motion-reduce:transition-none"
            @click="dismiss"
        >
            <X class="h-4 w-4" aria-hidden="true" />
        </button>
    </div>
</template>
