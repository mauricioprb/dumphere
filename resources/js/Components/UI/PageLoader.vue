<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { useI18n } from '@/Composables/useI18n';

const SHOW_DELAY_MS = 120;
const MINIMUM_VISIBLE_MS = 240;

const { t } = useI18n();
const isVisible = ref(false);
const isPageVisible = ref(true);

let showTimer: number | undefined;
let hideTimer: number | undefined;
let shownAt = 0;
let removeStartListener: (() => void) | undefined;
let removeFinishListener: (() => void) | undefined;

function clearTimer(timer: number | undefined) {
    if (timer !== undefined) {
        window.clearTimeout(timer);
    }
}

function showLoader() {
    clearTimer(hideTimer);
    clearTimer(showTimer);

    if (isVisible.value) return;

    showTimer = window.setTimeout(() => {
        shownAt = performance.now();
        isVisible.value = true;
        showTimer = undefined;
    }, SHOW_DELAY_MS);
}

function hideLoader() {
    clearTimer(showTimer);
    showTimer = undefined;

    if (!isVisible.value) return;

    const visibleFor = performance.now() - shownAt;
    const remaining = Math.max(0, MINIMUM_VISIBLE_MS - visibleFor);

    clearTimer(hideTimer);
    hideTimer = window.setTimeout(() => {
        isVisible.value = false;
        hideTimer = undefined;
    }, remaining);
}

function updatePageVisibility() {
    isPageVisible.value = document.visibilityState === 'visible';
}

onMounted(() => {
    isPageVisible.value = document.visibilityState === 'visible';
    document.addEventListener('visibilitychange', updatePageVisibility);

    removeStartListener = router.on('start', showLoader);
    removeFinishListener = router.on('finish', hideLoader);
});

onBeforeUnmount(() => {
    clearTimer(showTimer);
    clearTimer(hideTimer);
    removeStartListener?.();
    removeFinishListener?.();
    document.removeEventListener('visibilitychange', updatePageVisibility);
});
</script>

<template>
    <Teleport to="body">
        <Transition name="page-loader">
            <div
                v-if="isVisible"
                class="page-loader-overlay fixed inset-0 z-200 grid place-items-center"
                role="status"
                aria-live="polite"
                aria-atomic="true"
            >
                <div class="page-loader-stage" :class="{ 'page-loader-stage--paused': !isPageVisible }">
                    <div class="page-loader-wordmark" translate="no" aria-hidden="true">
                        <span>dump<span class="page-loader-slash">/</span></span>
                        <span class="page-loader-selection">
                            <span class="page-loader-selection__text">here</span>
                            <span class="page-loader-selection__fill">here</span>
                        </span>
                    </div>

                    <div class="page-loader-status">
                        <span class="page-loader-status__signal" aria-hidden="true"></span>
                        <span class="page-loader-label">{{ t('loader.loading') }}</span>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.page-loader-overlay {
    background: var(--workspace-paper);
    color: var(--workspace-ink);
}

.page-loader-stage {
    display: grid;
    width: min(calc(100% - 2.5rem), 46rem);
    justify-items: center;
    gap: clamp(1.5rem, 3vw, 2.25rem);
}

.page-loader-wordmark {
    display: flex;
    align-items: baseline;
    justify-content: center;
    column-gap: 0.08em;
    font-family: 'Bricolage Grotesque', 'Inter', sans-serif;
    font-size: clamp(3.5rem, 12vw, 6rem);
    font-weight: 700;
    line-height: 0.9;
    letter-spacing: -0.035em;
    white-space: nowrap;
}

.page-loader-slash {
    display: inline-block;
    margin-left: 0.015em;
    color: var(--brand-slash);
}

.page-loader-selection {
    position: relative;
    display: inline-block;
    box-sizing: border-box;
    padding: 0.015em 0.085em 0.055em 0.06em;
}

.page-loader-selection__text,
.page-loader-selection__fill {
    white-space: nowrap;
}

.page-loader-selection__fill {
    position: absolute;
    inset: 0;
    box-sizing: border-box;
    overflow: hidden;
    padding: inherit;
    animation: page-loader-selection 1.65s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    background: var(--workspace-accent);
    color: var(--workspace-accent-ink);
    clip-path: inset(0 100% 0 0);
}

.page-loader-status {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding-top: 0.8rem;
    border-top: 1px solid var(--workspace-rule);
}

.page-loader-status__signal {
    width: 0.5rem;
    height: 0.5rem;
    background: var(--workspace-live);
}

.page-loader-label {
    color: var(--workspace-muted);
    font-family: 'Bricolage Grotesque', 'Inter', sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.025em;
}

.page-loader-stage--paused .page-loader-selection__fill {
    animation-play-state: paused;
}

.page-loader-enter-active {
    transition: opacity 180ms cubic-bezier(0.16, 1, 0.3, 1);
}

.page-loader-leave-active {
    transition: opacity 120ms ease-in;
}

.page-loader-enter-from,
.page-loader-leave-to {
    opacity: 0;
}

@keyframes page-loader-selection {
    0%,
    12% {
        clip-path: inset(0 100% 0 0);
    }

    50%,
    72% {
        clip-path: inset(0);
    }

    100% {
        clip-path: inset(0 0 0 100%);
    }
}

@media (prefers-reduced-motion: reduce) {
    .page-loader-selection__fill {
        animation: none;
        clip-path: inset(0);
    }

    .page-loader-enter-active,
    .page-loader-leave-active {
        transition: none;
    }
}
</style>
