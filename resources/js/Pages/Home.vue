<script setup lang="ts">
import { ref } from 'vue'
import { Head } from '@inertiajs/vue3'
import AppLayout from '@/Components/Layout/AppLayout.vue'
import ThemeToggle from '@/Components/UI/ThemeToggle.vue'
import { useI18n } from '@/Composables/useI18n'

const { t } = useI18n()

const slugInput = ref('')
const examples = ['notas-reuniao', 'lista-compras', 'ideias-projeto']

function goToDocument() {
    const slug = slugInput.value.trim().toLowerCase().replace(/[^a-z0-9\-]/g, '-')
    if (slug) {
        window.location.href = `/${slug}`
    }
}
</script>

<template>
    <Head :title="t('app.titleFull')" />
    <AppLayout>
        <div class="flex-1 flex flex-col items-center justify-center px-4 relative">
            <div class="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div class="max-w-2xl w-full text-center space-y-8">
                <div class="space-y-4">
                    <h1 class="text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
                        {{ t('home.heading') }}
                    </h1>
                    <p class="text-xl text-neutral-500 dark:text-neutral-400">
                        {{ t('home.subheading') }}
                        <br />
                        {{ t('home.subheading2') }}
                    </p>
                </div>

                <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-8 space-y-6">
                    <h2 class="text-lg font-semibold text-neutral-700 dark:text-neutral-200">
                        {{ t('home.getStarted') }}
                    </h2>
                    <p class="text-neutral-500 dark:text-neutral-400">
                        {{ t('home.inputHint') }}
                    </p>
                    <div class="flex flex-col sm:flex-row gap-3">
                        <input
                            v-model="slugInput"
                            type="text"
                            :placeholder="t('home.inputPlaceholder')"
                            class="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-neutral-400 dark:placeholder-neutral-500"
                            @keyup.enter="goToDocument"
                        />
                        <button
                            @click="goToDocument"
                            class="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
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

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                    <div class="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-5 space-y-2">
                        <div class="text-2xl">✏️</div>
                        <h3 class="font-semibold text-neutral-800 dark:text-neutral-100">{{ t('features.markdown') }}</h3>
                        <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ t('features.markdownDesc') }}</p>
                    </div>
                    <div class="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-5 space-y-2">
                        <div class="text-2xl">👥</div>
                        <h3 class="font-semibold text-neutral-800 dark:text-neutral-100">{{ t('features.realtime') }}</h3>
                        <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ t('features.realtimeDesc') }}</p>
                    </div>
                    <div class="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-5 space-y-2">
                        <div class="text-2xl">🔓</div>
                        <h3 class="font-semibold text-neutral-800 dark:text-neutral-100">{{ t('features.noLogin') }}</h3>
                        <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ t('features.noLoginDesc') }}</p>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
