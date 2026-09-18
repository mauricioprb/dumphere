<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import { ArrowRight } from '@lucide/vue';
import AppLayout from '@/Components/Layout/AppLayout.vue';
import ExternalPageShell from '@/Components/Layout/ExternalPageShell.vue';
import GithubMark from '@/Components/UI/GithubMark.vue';
import { useI18n } from '@/Composables/useI18n';
import { appName, sourceUrl } from '@/Lib/brand';
import { useTypewriter } from '@/Composables/useTypewriter';
import { useAppHost } from '@/Composables/useAppUrl';
import { normalizeDocumentPath } from '@/Lib/documentPath';
import { generateUniqueCollaboratorName } from '@/Lib/collaboratorIdentity';

const { t } = useI18n();
const appHost = useAppHost();

const slugInput = ref('');
const inputError = ref('');
const isNavigating = ref(false);
const year = new Date().getFullYear();
const guestName = generateUniqueCollaboratorName([]);

const examples = computed(() => [t('home.example1'), t('home.example2'), t('home.example3')]);

const GUEST_ARRIVAL_DELAY = 1500;
const GUEST_TYPING_DELAY = 420;
const GUEST_CHARACTER_INTERVAL = 28;

const heroObject = computed(() => t('home.heroObject'));
const headline = useTypewriter(heroObject, {
    startDelay: 340,
    interval: 78,
    immediate: true,
});
const typedHeroObject = headline.typed;
const hasFinishedTyping = headline.isDone;

const disclosureAccess = computed(() => t('home.disclosureAccess'));
const disclosureExpiry = computed(() => t('home.disclosureExpiry'));
const disclosureText = computed(() => disclosureAccess.value + disclosureExpiry.value);
const guest = useTypewriter(disclosureText, {
    startDelay: GUEST_TYPING_DELAY,
    interval: GUEST_CHARACTER_INTERVAL,
});

const guestArrived = ref(guest.prefersReducedMotion);
const typedAccess = computed(() => guest.typed.value.slice(0, disclosureAccess.value.length));
const typedExpiry = computed(() => guest.typed.value.slice(disclosureAccess.value.length));
const accessComplete = computed(() => guest.typed.value.length >= disclosureAccess.value.length);
const guestIsIdle = computed(() => guest.isDone.value);

let arrivalTimer: number | undefined;

watch(
    hasFinishedTyping,
    (done) => {
        if (!done || guest.prefersReducedMotion || guestArrived.value) {
            return;
        }

        arrivalTimer = window.setTimeout(() => {
            guestArrived.value = true;
            guest.start();
        }, GUEST_ARRIVAL_DELAY);
    },
    { immediate: true },
);

onBeforeUnmount(() => window.clearTimeout(arrivalTimer));

function goToDocument() {
    const slug = normalizeDocumentPath(slugInput.value);

    if (!slug) {
        inputError.value = t('home.inputError');
        return;
    }

    inputError.value = '';
    router.visit(`/${slug}`, {
        onStart: () => {
            isNavigating.value = true;
        },
        onFinish: () => {
            isNavigating.value = false;
        },
    });
}

function clearError() {
    inputError.value = '';
}
</script>

<template>
    <AppLayout>
        <ExternalPageShell
            eager-artwork
            class="entry-surface grid min-h-dvh grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden"
            aria-labelledby="entry-title"
        >
            <div
                class="relative z-2 mx-auto grid w-[min(100%,96rem)] grid-cols-[minmax(0,2.25fr)_minmax(17rem,0.75fr)] items-center gap-[clamp(3rem,7vw,8rem)] px-[clamp(1.1rem,3vw,2.75rem)] py-[clamp(4rem,10vh,8rem)] max-[760px]:grid-cols-[minmax(0,1fr)] max-[760px]:content-center max-[760px]:gap-10 max-[760px]:py-16 max-[760px]:pb-10"
            >
                <div class="min-w-0">
                    <h1
                        id="entry-title"
                        class="mb-[clamp(3.25rem,7vh,5.75rem)] flex max-w-[9ch] flex-col items-start font-display text-[clamp(3.6rem,7vw,6rem)] leading-[0.92] font-[560] tracking-[-0.04em] text-balance text-(--external-ink) max-[760px]:mb-14 max-[760px]:max-w-[8ch] max-[760px]:text-[clamp(3.4rem,15.5vw,5.1rem)]"
                    >
                        <span>{{ t('home.heroLead') }}</span>
                        <span class="selection-word" :class="{ 'selection-word--filled': hasFinishedTyping }">
                            <span class="selection-word__text" aria-hidden="true"
                                ><span class="selection-word__ghost">{{ heroObject }}</span
                                >{{ typedHeroObject }}</span
                            >
                            <span class="selection-word__fill" aria-hidden="true">{{ heroObject }}</span>
                            <span class="sr-only">{{ heroObject }}</span>
                            <span
                                class="collaboration-carets__caret selection-word__caret"
                                :class="{
                                    'selection-word__caret--idle': hasFinishedTyping,
                                }"
                                aria-hidden="true"
                            >
                                <span class="collaboration-carets__label">{{ t('home.presenceYou') }}</span>
                            </span>
                        </span>
                    </h1>

                    <form class="entry-form w-full" :aria-busy="isNavigating" @submit.prevent="goToDocument">
                        <label
                            for="document-path"
                            class="mb-[0.7rem] block text-[0.82rem] leading-[1.3] font-[650] text-(--external-muted)"
                        >
                            {{ t('home.inputLabel') }}
                        </label>
                        <div class="entry-form__control" :class="{ 'has-error': inputError }">
                            <span class="entry-form__origin" aria-hidden="true">{{ appHost }}/</span>
                            <input
                                id="document-path"
                                v-model="slugInput"
                                type="text"
                                list="document-examples"
                                :placeholder="t('home.inputPlaceholder')"
                                autocomplete="off"
                                autocapitalize="none"
                                spellcheck="false"
                                :aria-invalid="inputError ? 'true' : undefined"
                                aria-describedby="document-path-feedback access-note"
                                @input="clearError"
                            />
                            <button type="submit" :disabled="isNavigating || !slugInput.trim()">
                                <span>{{ isNavigating ? t('home.opening') : t('home.openButton') }}</span>
                                <ArrowRight :size="19" aria-hidden="true" />
                            </button>
                        </div>
                        <datalist id="document-examples">
                            <option v-for="example in examples" :key="example" :value="example" />
                        </datalist>
                        <p
                            id="document-path-feedback"
                            class="mt-[0.55rem] min-h-5 text-[0.86rem] font-semibold text-(--external-error)"
                            role="alert"
                        >
                            {{ inputError }}
                        </p>
                    </form>

                    <p
                        id="access-note"
                        class="mt-[1.15rem] flex flex-wrap items-center gap-3 text-[0.82rem] leading-[1.3] font-[650] text-(--external-muted) max-[760px]:flex-col max-[760px]:items-start max-[760px]:gap-[0.3rem]"
                    >
                        <span class="typed-clause">
                            <span class="typed-clause__ghost" aria-hidden="true">{{ disclosureAccess }}</span>
                            <span class="typed-clause__value" aria-hidden="true"
                                >{{ typedAccess
                                }}<span
                                    v-if="guestArrived && !accessComplete"
                                    class="collaboration-carets__caret collaborator-caret"
                                    :class="{ 'collaborator-caret--idle': guestIsIdle }"
                                    ><span class="collaboration-carets__label">{{ guestName }}</span></span
                                ></span
                            >
                        </span>
                        <span
                            class="external-divider max-[760px]:hidden"
                            :class="{ invisible: !accessComplete }"
                            aria-hidden="true"
                        />
                        <span class="typed-clause">
                            <span class="typed-clause__ghost" aria-hidden="true">{{ disclosureExpiry }}</span>
                            <span class="typed-clause__value" aria-hidden="true"
                                >{{ typedExpiry
                                }}<span
                                    v-if="guestArrived && accessComplete"
                                    class="collaboration-carets__caret collaborator-caret"
                                    :class="{ 'collaborator-caret--idle': guestIsIdle }"
                                    ><span class="collaboration-carets__label">{{ guestName }}</span></span
                                ></span
                            >
                        </span>
                        <span class="sr-only">{{ disclosureAccess }}. {{ disclosureExpiry }}.</span>
                    </p>
                </div>
            </div>

            <footer
                class="relative z-2 mx-auto flex w-[min(100%,96rem)] items-center gap-[0.85rem] px-[clamp(1.1rem,3vw,2.75rem)] pt-4 pb-[clamp(1.1rem,3vw,2.75rem)] text-[0.78rem] text-(--external-muted)"
            >
                <span>&copy; {{ year }} {{ appName }}</span>
                <span class="external-divider" aria-hidden="true" />
                <Link
                    href="/terms"
                    class="external-focus text-inherit underline underline-offset-[0.2em] hover:text-(--external-ink)"
                >
                    {{ t('terms.heading') }}
                </Link>
                <span class="external-divider" aria-hidden="true" />
                <a
                    :href="sourceUrl"
                    rel="noopener"
                    class="external-focus text-inherit transition-colors hover:text-(--external-ink)"
                    :aria-label="t('footer.source')"
                >
                    <GithubMark class="size-[1.15em]" />
                </a>
            </footer>
        </ExternalPageShell>
    </AppLayout>
</template>
