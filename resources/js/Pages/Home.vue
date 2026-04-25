<script setup lang="ts">
import { ref } from 'vue'
import { Head } from '@inertiajs/vue3'
import AppLayout from '@/Components/Layout/AppLayout.vue'
import ThemeToggle from '@/Components/UI/ThemeToggle.vue'
import { useI18n } from '@/Composables/useI18n'
import { FileEdit, Users, LockOpen, FileText } from 'lucide-vue-next'

const { t } = useI18n()

const slugInput = ref('')
const examples = ['notas-reuniao', 'lista-compras', 'ideias-projeto']
const year = new Date().getFullYear()

function goToDocument() {
    const slug = slugInput.value.trim().replace(/^\/+/, '').toLowerCase().replace(/[^a-z0-9\-]/g, '-').replace(/^-+|-+$/g, '')
    if (slug) {
        window.location.href = `/${slug}`
    }
}
</script>

<template>
    <Head :title="t('app.titleFull')" />
    <AppLayout>
        <div class="flex-1 flex flex-col items-center px-4 sm:px-6 py-6 sm:py-0 sm:justify-center overflow-y-auto relative">
            <div class="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                <ThemeToggle />
            </div>

            <div class="max-w-4xl w-full text-center space-y-5 sm:space-y-8">
                <div class="space-y-2 sm:space-y-4 pt-8 sm:pt-0">
                    <h1 class="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center justify-center gap-3">
                        <FileText class="w-8 h-8 sm:w-12 sm:h-12 text-primary-600 dark:text-primary-400" :stroke-width="1.75" />
                        {{ t('home.heading') }}
                    </h1>
                    <p class="text-sm sm:text-xl text-neutral-500 dark:text-neutral-400 leading-relaxed">
                        {{ t('home.subheading') }}
                    </p>
                </div>

                <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-5 sm:p-8 space-y-4 sm:space-y-6">
                    <p class="text-base text-neutral-500 dark:text-neutral-400">
                        {{ t('home.inputHint') }}
                    </p>
                    <div class="flex flex-col sm:flex-row gap-3">
                        <input
                            v-model="slugInput"
                            type="text"
                            :placeholder="t('home.inputPlaceholder')"
                            class="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 px-4 py-2.5 sm:py-3 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-neutral-400 dark:placeholder-neutral-500"
                            @keyup.enter="goToDocument"
                        />
                        <button
                            @click="goToDocument"
                            class="px-6 py-2.5 sm:py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 cursor-pointer"
                        >
                            {{ t('home.openButton') }}
                        </button>
                    </div>
                    <div class="flex flex-wrap gap-2 justify-center">
                        <a
                            v-for="example in examples"
                            :key="example"
                            :href="`/${example}`"
                            class="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300 rounded-full text-sm transition-colors"
                        >
                            /{{ example }}
                        </a>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-left pb-2 sm:pb-0">
                    <div class="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 sm:p-5 space-y-1.5 sm:space-y-2">
                        <div class="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                            <FileEdit class="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h3 class="text-base font-semibold text-neutral-800 dark:text-neutral-100">{{ t('features.markdown') }}</h3>
                        <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ t('features.markdownDesc') }}</p>
                    </div>
                    <div class="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 sm:p-5 space-y-1.5 sm:space-y-2">
                        <div class="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                            <Users class="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h3 class="text-base font-semibold text-neutral-800 dark:text-neutral-100">{{ t('features.realtime') }}</h3>
                        <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ t('features.realtimeDesc') }}</p>
                    </div>
                    <div class="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 sm:p-5 space-y-1.5 sm:space-y-2">
                        <div class="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                            <LockOpen class="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h3 class="text-base font-semibold text-neutral-800 dark:text-neutral-100">{{ t('features.noLogin') }}</h3>
                        <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ t('features.noLoginDesc') }}</p>
                    </div>
                </div>
                <p class="text-xs text-neutral-400 dark:text-neutral-600 text-center pb-4 sm:pb-0">
                    &copy; {{ year }} Dumphere
                    &nbsp;&middot;&nbsp;
                    <a href="/terms" class="text-neutral-500 dark:text-neutral-400 underline underline-offset-2 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors">
                        {{ t('terms.heading') }}
                    </a>
                </p>
            </div>
        </div>
    </AppLayout>
</template>
