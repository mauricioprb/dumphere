<script setup lang="ts">
import { useTheme } from '@/Composables/useTheme'
import { useI18n } from '@/Composables/useI18n'
import { Sun, Moon } from '@lucide/vue'

const { isDark, toggleTheme } = useTheme()
const { t } = useI18n()
</script>

<template>
    <button
        type="button"
        @click="toggleTheme"
        :aria-label="t('theme.toggle')"
        :title="t('theme.toggle')"
        class="p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
        <Sun v-if="isDark" class="w-5 h-5" :stroke-width="2" aria-hidden="true" />
        <Moon v-else class="w-5 h-5" :stroke-width="2" aria-hidden="true" />
    </button>
</template>
