<script setup lang="ts">
import type { PresenceUser } from '@/types/document';
import { collaboratorInkColor } from '@/Lib/collaboratorIdentity';

defineProps<{
    user: PresenceUser;
}>();
</script>

<template>
    <li
        class="presence-badge flex size-7 cursor-default items-center justify-center rounded-full border border-(--workspace-paper) text-[0.7rem] font-bold"
        :style="{ backgroundColor: user.color, color: collaboratorInkColor(user.color) }"
        :aria-label="user.name"
    >
        <span aria-hidden="true">{{ user.name.charAt(0).toUpperCase() }}</span>
    </li>
</template>
