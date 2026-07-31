<script setup lang="ts">
import { useTheme } from '@/Composables/useTheme'
import { useI18n } from '@/Composables/useI18n'

useTheme()
useI18n()
</script>

<template>
    <div class="h-dvh min-h-screen flex flex-col bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-200">
        <slot />
    </div>
</template>
