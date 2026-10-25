<script setup lang="ts">
import { appName } from '@/Lib/brand';
</script>

<template>
    <span class="wordmark" translate="no">
        <span aria-hidden="true">dump<span class="wordmark__slash">/</span>here</span>
        <span class="sr-only">{{ appName }}</span>
    </span>
</template>
