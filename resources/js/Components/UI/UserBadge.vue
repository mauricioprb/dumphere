<script setup lang="ts">
import type { PresenceUser } from '@/types/document'

const props = defineProps<{
    user: PresenceUser
}>()
</script>

<template>
    <div
        class="w-7 h-7 rounded-full border-2 border-white dark:border-neutral-900 flex items-center justify-center text-xs font-bold text-white shadow-sm cursor-default"
        :style="{ backgroundColor: user.color }"
        :title="user.name"
    >
        {{ user.name.charAt(0).toUpperCase() }}
    </div>
</template>
