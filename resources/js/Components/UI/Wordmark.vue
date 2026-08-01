<script setup lang="ts">
import { useI18n } from '@/Composables/useI18n';

const { t } = useI18n();
</script>

<template>
    <span class="wordmark" translate="no">
        <span aria-hidden="true">dump<span class="wordmark__slash">/</span>here</span>
        <span class="sr-only">{{ t('app.title') }}</span>
    </span>
</template>
