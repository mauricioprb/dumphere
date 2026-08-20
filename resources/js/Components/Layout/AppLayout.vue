<script setup lang="ts">
import { watchEffect } from 'vue';
import { usePage } from '@inertiajs/vue3';
import { applyAddressTheme } from '@/Lib/dailyTheme';
import { useTheme } from '@/Composables/useTheme';
import { useI18n } from '@/Composables/useI18n';
import SeoHead from '@/Components/UI/SeoHead.vue';

withDefaults(
    defineProps<{
        fixedViewport?: boolean;
    }>(),
    {
        fixedViewport: true,
    },
);

useTheme();
const { t } = useI18n();
const page = usePage();

watchEffect(() => {
    applyAddressTheme(document.documentElement, {
        hue: (page.props.themeHue ?? null) as number | null,
        chroma: (page.props.themeChroma ?? null) as number | null,
        hueDark: (page.props.themeHueDark ?? null) as number | null,
        chromaDark: (page.props.themeChromaDark ?? null) as number | null,
    });
});
</script>

<template>
    <div
        class="app-shell flex flex-col bg-(--workspace-paper) font-sans text-(--workspace-ink) transition-colors duration-200 motion-reduce:transition-none"
        :class="fixedViewport ? 'h-dvh min-h-screen' : 'min-h-screen'"
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
