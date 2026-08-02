<script setup lang="ts">
import { useTheme } from '@/Composables/useTheme';
import { useI18n } from '@/Composables/useI18n';
import SeoHead from '@/Components/UI/SeoHead.vue';

useTheme();
const { t } = useI18n();
</script>

<template>
    <div
        class="app-shell flex h-dvh min-h-screen flex-col bg-(--workspace-paper) font-sans text-(--workspace-ink) transition-colors duration-200 motion-reduce:transition-none"
    >
        <SeoHead />
        <a
            href="#main-content"
            class="fixed top-3 left-4 z-100 -translate-y-20 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform focus:translate-y-0 focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:outline-none motion-reduce:transition-none dark:bg-neutral-50 dark:text-neutral-900"
        >
            {{ t('navigation.skip') }}
        </a>
        <slot />
    </div>
</template>
