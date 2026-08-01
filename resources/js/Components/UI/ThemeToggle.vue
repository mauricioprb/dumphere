<script setup lang="ts">
import { useTheme } from '@/Composables/useTheme';
import { useI18n } from '@/Composables/useI18n';
import { Sun, Moon } from '@lucide/vue';

const { isDark, toggleTheme } = useTheme();
const { t } = useI18n();
</script>

<template>
    <button
        type="button"
        :aria-label="isDark ? t('theme.useLight') : t('theme.useDark')"
        :title="isDark ? t('theme.useLight') : t('theme.useDark')"
        :aria-pressed="isDark"
        class="theme-toggle relative inline-flex h-11 w-14 shrink-0 items-center justify-center rounded-full focus:outline-none"
        @click="toggleTheme"
    >
        <span class="theme-toggle__track absolute inset-x-1 top-2.5 h-6 rounded-full border" aria-hidden="true" />
        <Sun class="theme-toggle__icon absolute top-4 left-2.5 size-3" :stroke-width="1.8" aria-hidden="true" />
        <Moon class="theme-toggle__icon absolute top-4 right-2.5 size-3" :stroke-width="1.8" aria-hidden="true" />
        <span class="theme-toggle__thumb absolute top-3.5 left-2 size-4 rounded-full" aria-hidden="true" />
    </button>
</template>
