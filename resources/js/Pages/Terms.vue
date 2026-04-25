<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import AppLayout from '@/Components/Layout/AppLayout.vue'
import ThemeToggle from '@/Components/UI/ThemeToggle.vue'
import { useI18n } from '@/Composables/useI18n'
import { FileText, ArrowLeft, Globe, ShieldOff, Clock, AlertTriangle } from 'lucide-vue-next'

const { t } = useI18n()
</script>

<template>
    <Head :title="t('terms.pageTitle')" />
    <AppLayout>
        <div class="flex-1 overflow-y-auto">
            <div class="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                <ThemeToggle />
            </div>

            <div class="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
                <div class="space-y-3">
                    <a
                        href="/"
                        class="inline-flex items-center gap-1.5 text-sm text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                    >
                        <ArrowLeft class="w-4 h-4" />
                        {{ t('terms.back') }}
                    </a>

                    <div class="flex items-center gap-3">
                        <FileText class="w-7 h-7 text-primary-600 dark:text-primary-400 shrink-0" :stroke-width="1.75" />
                        <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
                            {{ t('terms.heading') }}
                        </h1>
                    </div>
                    <p class="text-sm text-neutral-400 dark:text-neutral-500">{{ t('terms.lastUpdated') }}</p>
                </div>

                <div class="bg-warning-500/10 border border-warning-500/30 rounded-xl p-4 sm:p-5 flex gap-3">
                    <AlertTriangle class="w-5 h-5 text-warning-500 shrink-0 mt-0.5" />
                    <p class="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        {{ t('terms.banner') }}
                    </p>
                </div>

                <div class="space-y-8">
                    <section class="space-y-3">
                        <div class="flex items-center gap-2">
                            <Globe class="w-5 h-5 text-primary-500 dark:text-primary-400 shrink-0" />
                            <h2 class="text-base font-semibold text-neutral-800 dark:text-neutral-100">
                                {{ t('terms.public.title') }}
                            </h2>
                        </div>
                        <p class="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed pl-7">
                            {{ t('terms.public.body') }}
                        </p>
                    </section>

                    <div class="border-t border-neutral-200 dark:border-neutral-700" />

                    <section class="space-y-3">
                        <div class="flex items-center gap-2">
                            <ShieldOff class="w-5 h-5 text-primary-500 dark:text-primary-400 shrink-0" />
                            <h2 class="text-base font-semibold text-neutral-800 dark:text-neutral-100">
                                {{ t('terms.noResponsibility.title') }}
                            </h2>
                        </div>
                        <p class="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed pl-7">
                            {{ t('terms.noResponsibility.body') }}
                        </p>
                    </section>

                    <div class="border-t border-neutral-200 dark:border-neutral-700" />

                    <section class="space-y-3">
                        <div class="flex items-center gap-2">
                            <Clock class="w-5 h-5 text-primary-500 dark:text-primary-400 shrink-0" />
                            <h2 class="text-base font-semibold text-neutral-800 dark:text-neutral-100">
                                {{ t('terms.retention.title') }}
                            </h2>
                        </div>
                        <p class="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed pl-7">
                            {{ t('terms.retention.body') }}
                        </p>
                    </section>

                    <div class="border-t border-neutral-200 dark:border-neutral-700" />

                    <section class="space-y-3">
                        <div class="flex items-center gap-2">
                            <AlertTriangle class="w-5 h-5 text-primary-500 dark:text-primary-400 shrink-0" />
                            <h2 class="text-base font-semibold text-neutral-800 dark:text-neutral-100">
                                {{ t('terms.noSensitive.title') }}
                            </h2>
                        </div>
                        <p class="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed pl-7">
                            {{ t('terms.noSensitive.body') }}
                        </p>
                    </section>
                </div>

                <div class="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <p class="text-xs text-neutral-400 dark:text-neutral-500 text-center">
                        Dumphere &mdash; {{ t('terms.footer') }}
                    </p>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
