<script setup lang="ts">
import { computed } from 'vue';
import { Link } from '@inertiajs/vue3';
import { ArrowLeft } from '@lucide/vue';
import AppLayout from '@/Components/Layout/AppLayout.vue';
import ExternalPageShell from '@/Components/Layout/ExternalPageShell.vue';
import { useI18n } from '@/Composables/useI18n';
import { useContactEmail } from '@/Composables/useAppUrl';

const { t } = useI18n();
const contactEmail = useContactEmail();
const year = new Date().getFullYear();

type Clause = {
    id: string;
    number: string;
    title: string;
    summary: string;
    paragraphs: string[];
    items?: string[];
    inventory?: { term: string; definition: string }[];
    closing?: string;
};

const truths = computed(() => [
    { word: t('terms.truth1.word'), body: t('terms.truth1.body') },
    { word: t('terms.truth2.word'), body: t('terms.truth2.body') },
    { word: t('terms.truth3.word'), body: t('terms.truth3.body') },
]);

const clauses = computed<Clause[]>(() => [
    {
        id: 'clause-1',
        number: '01',
        title: t('terms.s1.title'),
        summary: t('terms.s1.summary'),
        paragraphs: [t('terms.s1.p1'), t('terms.s1.p2')],
    },
    {
        id: 'clause-2',
        number: '02',
        title: t('terms.s2.title'),
        summary: t('terms.s2.summary'),
        paragraphs: [t('terms.s2.p1'), t('terms.s2.p2')],
    },
    {
        id: 'clause-3',
        number: '03',
        title: t('terms.s3.title'),
        summary: t('terms.s3.summary'),
        paragraphs: [t('terms.s3.p1'), t('terms.s3.p2')],
    },
    {
        id: 'clause-4',
        number: '04',
        title: t('terms.s4.title'),
        summary: t('terms.s4.summary'),
        paragraphs: [t('terms.s4.p1'), t('terms.s4.p2')],
    },
    {
        id: 'clause-5',
        number: '05',
        title: t('terms.s5.title'),
        summary: t('terms.s5.summary'),
        paragraphs: [t('terms.s5.p1'), t('terms.s5.p2'), t('terms.s5.p3')],
    },
    {
        id: 'clause-6',
        number: '06',
        title: t('terms.s6.title'),
        summary: t('terms.s6.summary'),
        paragraphs: [],
        items: [
            t('terms.s6.i1'),
            t('terms.s6.i2'),
            t('terms.s6.i3'),
            t('terms.s6.i4'),
            t('terms.s6.i5'),
            t('terms.s6.i6'),
        ],
    },
    {
        id: 'clause-7',
        number: '07',
        title: t('terms.s7.title'),
        summary: t('terms.s7.summary'),
        paragraphs: [t('terms.s7.p1'), t('terms.s7.p2')],
    },
    {
        id: 'clause-8',
        number: '08',
        title: t('terms.s8.title'),
        summary: t('terms.s8.summary'),
        paragraphs: [t('terms.s8.p1'), t('terms.s8.p2')],
    },
    {
        id: 'clause-9',
        number: '09',
        title: t('terms.s9.title'),
        summary: t('terms.s9.summary'),
        paragraphs: [t('terms.s9.p1'), t('terms.s9.p2')],
    },
    {
        id: 'clause-10',
        number: '10',
        title: t('terms.s10.title'),
        summary: t('terms.s10.summary'),
        paragraphs: [t('terms.s10.p1')],
        inventory: [
            { term: t('terms.s10.k1'), definition: t('terms.s10.v1') },
            { term: t('terms.s10.k2'), definition: t('terms.s10.v2') },
            { term: t('terms.s10.k3'), definition: t('terms.s10.v3') },
            { term: t('terms.s10.k4'), definition: t('terms.s10.v4') },
            { term: t('terms.s10.k5'), definition: t('terms.s10.v5') },
            { term: t('terms.s10.k6'), definition: t('terms.s10.v6') },
        ],
        closing: t('terms.s10.p2'),
    },
    {
        id: 'clause-11',
        number: '11',
        title: t('terms.s11.title'),
        summary: t('terms.s11.summary'),
        paragraphs: [t('terms.s11.p1'), t('terms.s11.p2')],
    },
    {
        id: 'clause-12',
        number: '12',
        title: t('terms.s12.title'),
        summary: t('terms.s12.summary'),
        paragraphs: [t('terms.s12.p1'), t('terms.s12.p2')],
    },
    {
        id: 'clause-13',
        number: '13',
        title: t('terms.s13.title'),
        summary: t('terms.s13.summary'),
        paragraphs: [t('terms.s13.p1'), t('terms.s13.p3'), t('terms.s13.p2')],
    },
    {
        id: 'clause-14',
        number: '14',
        title: t('terms.s14.title'),
        summary: t('terms.s14.summary'),
        paragraphs: [t('terms.s14.p1'), t('terms.s14.p2')],
    },
]);
</script>

<template>
    <AppLayout>
        <ExternalPageShell class="[scroll-padding-top:2rem] scroll-smooth motion-reduce:scroll-auto">
            <div class="relative z-[2] mx-auto w-[min(100%,54rem)] px-[clamp(1.1rem,3vw,2.75rem)] pb-4">
                <div class="pt-[clamp(1.5rem,5vh,3.5rem)]">
                    <Link
                        href="/"
                        class="external-focus inline-flex min-h-11 items-center gap-[0.45rem] text-[0.82rem] leading-[1.3] font-[650] text-[var(--external-muted)] no-underline transition-colors duration-[160ms] hover:text-[var(--external-ink)] motion-reduce:transition-none"
                    >
                        <ArrowLeft :size="16" aria-hidden="true" />
                        {{ t('terms.back') }}
                    </Link>

                    <h1
                        class="mt-[0.65rem] font-display text-[clamp(2.6rem,6vw,4.2rem)] leading-[0.95] font-[560] tracking-[-0.035em] text-balance text-[var(--external-ink)]"
                    >
                        {{ t('terms.heading') }}
                    </h1>

                    <p
                        class="mt-[1.1rem] flex flex-wrap items-center gap-[0.6rem] font-mono text-[0.82rem] leading-[1.4] text-[var(--external-muted)]"
                    >
                        <span>{{ t('terms.effectiveLabel') }}</span>
                        <time datetime="2026-08-01">{{ t('terms.effectiveDate') }}</time>
                    </p>
                </div>

                <section class="reading-principles mt-[clamp(2.75rem,7vh,4.5rem)]" :aria-label="t('terms.pageTitle')">
                    <div
                        v-for="truth in truths"
                        :key="truth.word"
                        class="grid grid-cols-[minmax(0,12.5rem)_minmax(0,1fr)] items-baseline gap-x-8 gap-y-[0.35rem] border-t border-[var(--external-rule)] py-[1.35rem] max-[760px]:grid-cols-[minmax(0,1fr)] max-[760px]:gap-y-2"
                    >
                        <p
                            class="font-display text-[clamp(1.75rem,4vw,2.4rem)] leading-[1.05] font-[560] tracking-[-0.03em] text-[var(--external-ink)]"
                        >
                            <span class="reading-mark">
                                <span>{{ truth.word }}</span>
                                <span class="reading-mark__fill" aria-hidden="true">{{ truth.word }}</span>
                            </span>
                        </p>
                        <p class="max-w-[46ch] text-[0.98rem] leading-[1.55] text-[var(--external-muted)]">
                            {{ truth.body }}
                        </p>
                    </div>
                    <p
                        class="max-w-[52ch] border-t border-[var(--external-rule)] py-[1.6rem] text-[clamp(1.05rem,2vw,1.22rem)] leading-[1.45] font-[650] text-[var(--external-ink)]"
                    >
                        {{ t('terms.truthClose') }}
                    </p>
                </section>

                <nav class="pt-[clamp(2.5rem,6vh,3.75rem)]" aria-labelledby="clause-index-title">
                    <h2
                        id="clause-index-title"
                        class="mb-[1.1rem] text-[0.82rem] leading-[1.3] font-[650] text-[var(--external-muted)]"
                    >
                        {{ t('terms.indexTitle') }}
                    </h2>
                    <ol class="grid list-none grid-cols-2 gap-x-10 p-0 max-[760px]:grid-cols-1">
                        <li v-for="clause in clauses" :key="clause.id">
                            <a
                                :href="`#${clause.id}`"
                                class="external-focus group grid grid-cols-[1.75rem_minmax(0,1fr)] gap-[0.6rem] py-2 text-[0.95rem] leading-[1.4] text-[var(--external-ink)] no-underline"
                            >
                                <span
                                    class="font-mono text-[0.82rem] text-[var(--external-muted)] transition-colors duration-[160ms] group-hover:text-[var(--external-live)] motion-reduce:transition-none"
                                    aria-hidden="true"
                                    >{{ clause.number }}</span
                                >
                                <span class="group-hover:underline group-hover:underline-offset-[0.2em]">{{
                                    clause.title
                                }}</span>
                            </a>
                        </li>
                    </ol>
                </nav>

                <div class="mt-[clamp(2.5rem,6vh,3.75rem)]">
                    <section
                        v-for="clause in clauses"
                        :id="clause.id"
                        :key="clause.id"
                        class="grid grid-cols-[3.5rem_minmax(0,1fr)] border-t border-[var(--external-rule)] py-[clamp(2rem,4vh,2.75rem)] max-[760px]:grid-cols-[minmax(0,1fr)]"
                        :aria-labelledby="`${clause.id}-title`"
                    >
                        <p
                            class="pt-[0.35rem] font-mono text-[0.82rem] leading-[1.4] text-[var(--external-muted)] max-[760px]:mb-2 max-[760px]:pt-0"
                            aria-hidden="true"
                        >
                            {{ clause.number }}
                        </p>
                        <div class="reading-prose">
                            <h2 :id="`${clause.id}-title`">{{ clause.title }}</h2>
                            <p class="reading-prose__summary">{{ clause.summary }}</p>
                            <p v-for="paragraph in clause.paragraphs" :key="paragraph">{{ paragraph }}</p>
                            <ul v-if="clause.items">
                                <li v-for="item in clause.items" :key="item">{{ item }}</li>
                            </ul>
                            <dl v-if="clause.inventory" class="reading-inventory">
                                <div v-for="entry in clause.inventory" :key="entry.term">
                                    <dt>{{ entry.term }}</dt>
                                    <dd>{{ entry.definition }}</dd>
                                </div>
                            </dl>
                            <p v-if="clause.closing">{{ clause.closing }}</p>
                        </div>
                    </section>
                </div>

                <section
                    class="border-t border-[var(--external-rule)] py-[clamp(2.25rem,5vh,3rem)]"
                    aria-labelledby="contact-title"
                >
                    <h2
                        id="contact-title"
                        class="mb-[0.55rem] font-display text-[clamp(1.3rem,2.6vw,1.62rem)] leading-[1.15] font-[560] tracking-[-0.025em] text-[var(--external-ink)]"
                    >
                        {{ t('terms.contact.title') }}
                    </h2>
                    <p class="max-w-[60ch] text-[0.95rem] leading-[1.62] text-[var(--external-muted)]">
                        {{ t('terms.contact.body') }}
                    </p>
                    <a
                        :href="`mailto:${contactEmail}`"
                        class="external-focus mt-[1.15rem] inline-block border-b-2 border-[var(--external-ink)] pb-[0.35rem] font-mono text-[clamp(1.02rem,2.4vw,1.3rem)] leading-[1.4] [overflow-wrap:anywhere] text-[var(--external-ink)] no-underline transition-colors duration-[160ms] hover:border-[var(--external-live)] hover:text-[var(--external-live)] motion-reduce:transition-none"
                    >
                        {{ contactEmail }}
                    </a>
                </section>

                <footer
                    class="flex flex-wrap items-center gap-[0.85rem] border-t border-[var(--external-rule)] py-[1.4rem] pb-10 text-[0.78rem] text-[var(--external-muted)]"
                >
                    <span>&copy; {{ year }} Dumphere</span>
                    <span class="external-divider" aria-hidden="true" />
                    <Link
                        href="/"
                        class="external-focus text-inherit underline underline-offset-[0.2em] hover:text-[var(--external-ink)]"
                        >{{ t('terms.footerHome') }}</Link
                    >
                    <span class="external-divider" aria-hidden="true" />
                    <span>{{ t('terms.footer') }}</span>
                </footer>
            </div>
        </ExternalPageShell>
    </AppLayout>
</template>
