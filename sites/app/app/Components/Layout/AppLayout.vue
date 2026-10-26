<script setup lang="ts">
import { watchEffect } from 'vue';
import { applyAddressTheme } from '@/Lib/dailyTheme';
import { useTheme } from '@/Composables/useTheme';
import { useI18n } from '@/Composables/useI18n';
import type { AddressTheme } from '@/types/document';

const props = withDefaults(
    defineProps<{
        fixedViewport?: boolean;
        theme?: AddressTheme | null;
    }>(),
    {
        fixedViewport: true,
        theme: null,
    },
);

useTheme();
const { t } = useI18n();

watchEffect(() => {
    applyAddressTheme(document.documentElement, {
        hue: props.theme?.themeHue ?? null,
        chroma: props.theme?.themeChroma ?? null,
        hueDark: props.theme?.themeHueDark ?? null,
        chromaDark: props.theme?.themeChromaDark ?? null,
    });
});
</script>

<template>
    <div
        class="app-shell flex flex-col bg-(--workspace-paper) font-sans text-(--workspace-ink) transition-colors duration-200 motion-reduce:transition-none"
        :class="fixedViewport ? 'h-dvh min-h-screen' : 'min-h-screen'"
    >
        <a
            href="#main-content"
            class="fixed top-3 left-4 z-100 -translate-y-20 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform focus:translate-y-0 focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:outline-none motion-reduce:transition-none dark:bg-neutral-50 dark:text-neutral-900"
        >
            {{ t('navigation.skip') }}
        </a>
        <slot />
    </div>
</template>
