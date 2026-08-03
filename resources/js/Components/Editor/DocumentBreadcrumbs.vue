<script setup lang="ts">
import { computed } from 'vue';
import { Link } from '@inertiajs/vue3';
import { ChevronRight } from '@lucide/vue';
import { useI18n } from '@/Composables/useI18n';
import { documentBreadcrumbs } from '@/Lib/documentTree';

const props = defineProps<{
    slug: string;
}>();

const { t } = useI18n();
const breadcrumbs = computed(() => documentBreadcrumbs(props.slug));
</script>

<template>
    <nav :aria-label="t('documentTree.breadcrumbs')" class="min-w-0 overflow-hidden">
        <ol class="flex min-w-0 items-center gap-1">
            <li
                v-for="(breadcrumb, index) in breadcrumbs"
                :key="breadcrumb.slug"
                :class="['min-w-0 items-center gap-1', index === breadcrumbs.length - 1 ? 'flex' : 'hidden sm:flex']"
            >
                <ChevronRight
                    v-if="index > 0"
                    class="hidden size-3.5 shrink-0 text-(--workspace-rule) sm:block"
                    aria-hidden="true"
                />
                <Link
                    v-if="index < breadcrumbs.length - 1"
                    :href="`/${breadcrumb.slug}`"
                    class="editor-focus inline-flex min-h-11 min-w-0 items-center rounded-md px-1 font-mono text-[0.78rem] text-(--workspace-muted) transition-colors hover:text-(--workspace-live) focus:outline-none motion-reduce:transition-none"
                >
                    <span class="truncate">{{ breadcrumb.label }}</span>
                </Link>
                <span
                    v-else
                    aria-current="page"
                    class="block max-w-36 truncate font-mono text-[0.78rem] text-(--workspace-ink) sm:max-w-48"
                >
                    {{ breadcrumb.label }}
                </span>
            </li>
        </ol>
    </nav>
</template>
