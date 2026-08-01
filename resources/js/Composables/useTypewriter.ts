import { computed, onBeforeUnmount, ref, watch, type Ref } from 'vue';

interface TypewriterOptions {
    startDelay?: number;

    interval?: number;

    immediate?: boolean;
}

export function useTypewriter(
    source: Ref<string>,
    { startDelay = 340, interval = 78, immediate = false }: TypewriterOptions = {},
) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const length = ref(prefersReducedMotion ? source.value.length : 0);
    const hasStarted = ref(prefersReducedMotion);

    const typed = computed(() => source.value.slice(0, length.value));
    const isDone = computed(() => hasStarted.value && length.value >= source.value.length);
    const isTyping = computed(() => hasStarted.value && !isDone.value);

    let startTimer: number | undefined;
    let characterTimer: number | undefined;

    function stop() {
        window.clearTimeout(startTimer);
        window.clearInterval(characterTimer);
        startTimer = undefined;
        characterTimer = undefined;
    }

    function start() {
        stop();

        if (prefersReducedMotion) {
            length.value = source.value.length;
            hasStarted.value = true;
            return;
        }

        length.value = 0;
        hasStarted.value = true;
        startTimer = window.setTimeout(() => {
            characterTimer = window.setInterval(() => {
                if (length.value >= source.value.length) {
                    stop();
                    return;
                }

                length.value += 1;
            }, interval);
        }, startDelay);
    }

    function reset() {
        stop();
        length.value = prefersReducedMotion ? source.value.length : 0;
        hasStarted.value = prefersReducedMotion;
    }

    watch(source, () => {
        if (hasStarted.value) start();
    });

    onBeforeUnmount(stop);

    if (immediate) start();

    return { typed, isDone, isTyping, hasStarted, prefersReducedMotion, start, reset };
}
