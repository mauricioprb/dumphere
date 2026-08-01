<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = withDefaults(
    defineProps<{
        cell?: number;

        density?: number;

        seed?: number;

        tile?: number;
    }>(),
    {
        cell: 1,
        density: 0.11,
        seed: 20250801,
        tile: 256,
    },
);

const maskImage = ref('');

let resolutionQuery: MediaQueryList | undefined;

function createRandom(seed: number) {
    let state = seed >>> 0;

    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let value = Math.imul(state ^ (state >>> 15), 1 | state);
        value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;

        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
}

function paint() {
    const ratio = window.devicePixelRatio || 1;
    const cells = Math.max(1, Math.round(props.tile / props.cell));
    const scale = Math.max(1, Math.round(props.cell * ratio));

    const grid = document.createElement('canvas');
    grid.width = cells;
    grid.height = cells;

    const gridContext = grid.getContext('2d');

    if (!gridContext) {
        return;
    }

    const pixels = gridContext.createImageData(cells, cells);
    const random = createRandom(props.seed);

    for (let index = 0; index < cells * cells; index += 1) {
        if (random() >= props.density) {
            continue;
        }

        const channel = index * 4;
        pixels.data[channel] = 255;
        pixels.data[channel + 1] = 255;
        pixels.data[channel + 2] = 255;
        pixels.data[channel + 3] = 255;
    }

    gridContext.putImageData(pixels, 0, 0);

    const block = document.createElement('canvas');
    block.width = cells * scale;
    block.height = cells * scale;

    const blockContext = block.getContext('2d');

    if (!blockContext) {
        return;
    }

    blockContext.imageSmoothingEnabled = false;
    blockContext.drawImage(grid, 0, 0, block.width, block.height);

    maskImage.value = `url("${block.toDataURL('image/png')}")`;
    watchResolution(ratio);
}

function watchResolution(ratio: number) {
    resolutionQuery?.removeEventListener('change', paint);
    resolutionQuery = window.matchMedia(`(resolution: ${ratio}dppx)`);
    resolutionQuery.addEventListener('change', paint);
}

onMounted(paint);

watch(() => [props.cell, props.density, props.seed, props.tile], paint);

onBeforeUnmount(() => resolutionQuery?.removeEventListener('change', paint));
</script>

<template>
    <div
        v-if="maskImage"
        class="noise-overlay"
        :style="{
            '--noise-mask': maskImage,
            '--noise-tile': `${tile}px`,
        }"
    />
</template>

<style scoped>
.noise-overlay {
    pointer-events: none;
    -webkit-mask-image: var(--noise-mask);
    mask-image: var(--noise-mask);
    -webkit-mask-size: var(--noise-tile) var(--noise-tile);
    mask-size: var(--noise-tile) var(--noise-tile);
    -webkit-mask-repeat: repeat;
    mask-repeat: repeat;
}
</style>
