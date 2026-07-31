<script setup lang="ts">
import { ref, computed } from 'vue'
import { Head, Link, router } from '@inertiajs/vue3'
import AppLayout from '@/Components/Layout/AppLayout.vue'
import ThemeToggle from '@/Components/UI/ThemeToggle.vue'
import { useI18n, type TranslationKey } from '@/Composables/useI18n'
import { normalizeDocumentPath } from '@/Lib/documentPath'
import { FileEdit, Users, LockOpen, FileText } from '@lucide/vue'

const { t } = useI18n()

const slugInput = ref('')
const inputError = ref('')
const isNavigating = ref(false)
const examples = computed(() => [
    'home.example1',
    'home.example2',
    'home.example3'
] as TranslationKey[])
const year = new Date().getFullYear()

function goToDocument() {
    const slug = normalizeDocumentPath(slugInput.value)

    if (!slug) {
        inputError.value = t('home.inputError')
        return
    }

    inputError.value = ''
    router.visit(`/${slug}`, {
        onStart: () => {
            isNavigating.value = true
        },
        onFinish: () => {
            isNavigating.value = false
        },
    })
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
                    <form
                        class="space-y-2"
                        @submit.prevent="goToDocument"
                    >
                        <div class="flex flex-col sm:flex-row gap-3">
                            <label for="document-path" class="sr-only">
                                {{ t('home.inputLabel') }}
                            </label>
                            <input
                                id="document-path"
                                v-model="slugInput"
                                type="text"
                                :placeholder="t('home.inputPlaceholder')"
                                autocomplete="off"
                                autocapitalize="none"
                                spellcheck="false"
                                :aria-invalid="inputError ? 'true' : undefined"
                                aria-describedby="document-path-help"
                                class="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 px-4 py-2.5 sm:py-3 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-neutral-400 dark:placeholder-neutral-500"
                                @input="inputError = ''"
                            />
                            <button
                                type="submit"
                                :disabled="isNavigating || !slugInput.trim()"
                                class="px-6 py-2.5 sm:py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {{ isNavigating ? t('home.opening') : t('home.openButton') }}
                            </button>
                        </div>
                        <p
                            id="document-path-help"
                            class="min-h-5 text-left text-sm text-danger-600 dark:text-danger-400"
                            role="alert"
                        >
                            {{ inputError }}
                        </p>
                    </form>
                    <div class="flex flex-wrap gap-2 justify-center">
                        <Link
                            v-for="example in examples"
                            :key="example"
                            :href="`/${t(example)}`"
                            prefetch
                            class="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300 rounded-full text-sm transition-colors"
                        >
                            /{{ t(example) }}
                        </Link>
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
                    <Link
                        href="/terms"
                        prefetch
                        class="text-neutral-500 dark:text-neutral-400 underline underline-offset-2 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                    >
                        {{ t('terms.heading') }}
                    </Link>
                </p>
            </div>
        </div>
    </AppLayout>
</template>
