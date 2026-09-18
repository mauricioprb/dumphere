<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import NoiseOverlay from '@/Components/UI/NoiseOverlay.vue';
import ThemeToggle from '@/Components/UI/ThemeToggle.vue';
import Wordmark from '@/Components/UI/Wordmark.vue';
import { appName } from '@/Lib/brand';

withDefaults(
    defineProps<{
        eagerArtwork?: boolean;
    }>(),
    {
        eagerArtwork: false,
    },
);
</script>

<template>
    <main
        id="main-content"
        tabindex="-1"
        class="external-page relative isolate min-h-0 flex-1 overflow-auto bg-(--external-paper) text-(--external-ink) focus:outline-none"
    >
        <div
            class="external-backdrop pointer-events-none fixed inset-0 z-0 overflow-hidden bg-(--external-paper)"
            aria-hidden="true"
        >
            <div class="external-backdrop__art absolute inset-0 z-1">
                <img
                    src="/images/external/external-bg.webp"
                    alt=""
                    width="4096"
                    height="4096"
                    decoding="async"
                    :loading="eagerArtwork ? 'eager' : 'lazy'"
                    :fetchpriority="eagerArtwork ? 'high' : undefined"
                />
            </div>
            <NoiseOverlay class="external-backdrop__noise absolute inset-0 z-2" />
        </div>

        <header
            class="external-utility relative z-2 mx-auto flex w-[min(100%,96rem)] items-center justify-between px-[clamp(1.1rem,3vw,2.75rem)] pt-[clamp(1.1rem,3vw,2.75rem)]"
        >
            <Link
                href="/"
                class="external-wordmark text-[1.08rem] text-(--external-ink) no-underline"
                :aria-label="appName"
            >
                <Wordmark />
            </Link>
            <ThemeToggle />
        </header>

        <slot />
    </main>
</template>
