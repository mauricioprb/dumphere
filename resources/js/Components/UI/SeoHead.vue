<script setup lang="ts">
import { computed } from 'vue';
import { Head, usePage } from '@inertiajs/vue3';
import type { SeoMetadata } from '@/types/seo';

const page = usePage();
const seo = computed(() => page.props.seo as SeoMetadata);
const structuredData = computed(() =>
    seo.value.structuredData === null ? '' : JSON.stringify(seo.value.structuredData),
);
</script>

<template>
    <Head :title="seo.title">
        <meta head-key="description" name="description" :content="seo.description" />
        <meta head-key="robots" name="robots" :content="seo.robots" />
        <meta head-key="theme-color" name="theme-color" :content="seo.themeColor" />
        <link head-key="canonical" rel="canonical" :href="seo.canonicalUrl" />
        <link head-key="sitemap" rel="sitemap" type="application/xml" :href="seo.sitemapUrl" />

        <meta head-key="og:type" property="og:type" :content="seo.type" />
        <meta head-key="og:site_name" property="og:site_name" :content="seo.siteName" />
        <meta head-key="og:title" property="og:title" :content="seo.title" />
        <meta head-key="og:description" property="og:description" :content="seo.description" />
        <meta head-key="og:url" property="og:url" :content="seo.canonicalUrl" />
        <meta head-key="og:locale" property="og:locale" :content="seo.locale" />
        <meta head-key="og:image" property="og:image" :content="seo.imageUrl" />
        <meta head-key="og:image:type" property="og:image:type" :content="seo.imageType" />
        <meta head-key="og:image:width" property="og:image:width" :content="String(seo.imageWidth)" />
        <meta head-key="og:image:height" property="og:image:height" :content="String(seo.imageHeight)" />
        <meta head-key="og:image:alt" property="og:image:alt" :content="seo.imageAlt" />

        <meta head-key="twitter:card" name="twitter:card" content="summary_large_image" />
        <meta head-key="twitter:title" name="twitter:title" :content="seo.title" />
        <meta head-key="twitter:description" name="twitter:description" :content="seo.description" />
        <meta head-key="twitter:image" name="twitter:image" :content="seo.imageUrl" />
        <meta head-key="twitter:image:alt" name="twitter:image:alt" :content="seo.imageAlt" />

        <component :is="'script'" v-if="structuredData" head-key="structured-data" type="application/ld+json">{{
            structuredData
        }}</component>
    </Head>
</template>
