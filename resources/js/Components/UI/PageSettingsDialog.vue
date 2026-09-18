<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import { Settings as SettingsIcon, X } from '@lucide/vue';
import { useI18n } from '@/Composables/useI18n';
import { applyAddressTheme } from '@/Lib/dailyTheme';
import { shouldPreviewSettings, shouldReloadSettings } from '@/Lib/pageSettings';

type Settings = {
    prefix: string;
    readonly: boolean;
    hasVisitorPassword: boolean;
    themeHue: number | null;
    themeChroma: number | null;
    themeHueDark: number | null;
    themeChromaDark: number | null;
    reservedUntil: string | null;
};

const props = defineProps<{ open: boolean; slug: string; prefix: string; isOwner: boolean }>();
const emit = defineEmits<{ 'update:open': [boolean] }>();

const { t } = useI18n();

const ownerPassword = ref('');
const settings = ref<Settings | null>(null);
const readonly = ref(false);
const visitorPassword = ref('');
const requirePassword = ref(false);
const ownTheme = ref(false);
const previewDark = ref(false);
const light = reactive({ hue: 0, chroma: 100 });
const dark = reactive({ hue: 0, chroma: 100 });

// The mode you are previewing is the mode you are editing.
const editing = computed(() => (previewDark.value ? dark : light));
let paletteBeforePreview: { style: string; dark: boolean } | null = null;
const error = ref('');
const busy = ref(false);
const passwordInput = ref<HTMLInputElement | null>(null);
let previouslyFocused: HTMLElement | null = null;

watch(
    () => props.open,
    (open) => {
        if (open) {
            previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            ownerPassword.value = '';
            settings.value = null;
            error.value = '';
            visitorPassword.value = '';
            requirePassword.value = false;
            previewDark.value = document.documentElement.classList.contains('dark');
            void send(false, true).then(() => {
                if (!settings.value) nextTick(() => passwordInput.value?.focus());
            });
        } else {
            const target = previouslyFocused;
            previouslyFocused = null;
            nextTick(() => target?.focus());
        }
    },
);

function currentHue(): number {
    const value = getComputedStyle(document.documentElement).getPropertyValue('--daily-hue');

    return Number.parseFloat(value) || 0;
}

function previewPalette(): void {
    const root = document.documentElement;

    paletteBeforePreview ??= {
        style: root.getAttribute('style') ?? '',
        dark: root.classList.contains('dark'),
    };

    applyAddressTheme(root, {
        hue: ownTheme.value ? light.hue : null,
        chroma: ownTheme.value ? light.chroma : null,
        hueDark: ownTheme.value ? dark.hue : null,
        chromaDark: ownTheme.value ? dark.chroma : null,
    });

    root.classList.toggle('dark', previewDark.value);
}

function dropPreview(): void {
    if (paletteBeforePreview === null) return;

    const root = document.documentElement;

    root.setAttribute('style', paletteBeforePreview.style);
    root.classList.toggle('dark', paletteBeforePreview.dark);
    paletteBeforePreview = null;
}

watch([() => props.open, light, dark, previewDark, ownTheme], () => {
    if (shouldPreviewSettings(props.open, settings.value !== null)) previewPalette();
});

function close(): void {
    dropPreview();
    emit('update:open', false);
}

async function send(apply: boolean, silent = false): Promise<void> {
    busy.value = true;
    error.value = '';

    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

    try {
        const response = await fetch(`/${props.slug}/settings`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': token },
            body: JSON.stringify({
                password: ownerPassword.value,
                apply,
                readonly: readonly.value,
                visitor_password: requirePassword.value ? visitorPassword.value || null : null,
                clear_visitor_password: !requirePassword.value,
                theme_hue: ownTheme.value ? light.hue : null,
                theme_chroma: ownTheme.value ? light.chroma : null,
                theme_hue_dark: ownTheme.value ? dark.hue : null,
                theme_chroma_dark: ownTheme.value ? dark.chroma : null,
            }),
        });

        if (!response.ok) {
            error.value = silent ? '' : await describeFailure(response);
            return;
        }

        const authenticatedNow = settings.value === null;

        settings.value = (await response.json()) as Settings;
        readonly.value = settings.value.readonly;
        requirePassword.value = settings.value.hasVisitorPassword;
        ownTheme.value = settings.value.themeHue !== null;
        light.hue = settings.value.themeHue ?? Math.round(currentHue());
        light.chroma = settings.value.themeChroma ?? 100;
        dark.hue = settings.value.themeHueDark ?? (light.hue + 180) % 360;
        dark.chroma = settings.value.themeChromaDark ?? light.chroma;
        visitorPassword.value = '';

        if (shouldReloadSettings(apply, authenticatedNow, props.isOwner)) {
            paletteBeforePreview = null;
            router.reload();
        }
    } catch {
        error.value = silent ? '' : t('ownership.failed');
    } finally {
        busy.value = false;
    }
}

async function describeFailure(response: Response): Promise<string> {
    if (response.status === 419) return t('ownership.sessionExpired');
    if (response.status === 429) return t('ownership.tooMany');

    if (response.status === 422) {
        const body = (await response.json().catch(() => null)) as { errors?: Record<string, string[]> } | null;
        const fields = Object.keys(body?.errors ?? {});

        if (fields.includes('password')) return t('ownership.wrongPassword');
        if (fields.includes('visitor_password')) return t('ownership.visitorPasswordMissing');
    }

    return t('ownership.failed');
}

function onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') close();
}
</script>

<template>
    <Teleport to="body">
        <div
            v-if="open"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
            @click.self="close"
            @keydown="onKeydown"
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="page-settings-title"
                class="editor-dialog w-full max-w-md overflow-hidden rounded-xl"
            >
                <div class="flex items-center gap-3 border-b border-(--workspace-rule) px-5 py-3">
                    <SettingsIcon class="size-5 shrink-0 text-(--workspace-live)" aria-hidden="true" />
                    <h2
                        id="page-settings-title"
                        class="flex-1 font-display text-xl font-medium tracking-tight text-(--workspace-ink)"
                    >
                        {{ t('ownership.title', { prefix }) }}
                    </h2>
                    <button
                        type="button"
                        :aria-label="t('ownership.close')"
                        class="editor-focus inline-flex size-11 items-center justify-center rounded-md text-(--workspace-muted) transition-colors hover:bg-(--workspace-panel) hover:text-(--workspace-ink) motion-reduce:transition-none"
                        @click="close"
                    >
                        <X class="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>

                <form class="flex flex-col gap-4 px-5 py-4" @submit.prevent="send(settings !== null)">
                    <div v-if="!settings" class="flex flex-col gap-1.5">
                        <label class="text-sm text-(--workspace-muted)" for="owner-password">
                            {{ t('ownership.ownerPassword') }}
                        </label>
                        <input
                            id="owner-password"
                            ref="passwordInput"
                            v-model="ownerPassword"
                            type="password"
                            autocomplete="current-password"
                            :required="!settings"
                            class="workspace-input"
                        />
                    </div>

                    <template v-if="settings">
                        <label class="flex min-h-11 items-center gap-2 text-(--workspace-ink)">
                            <input v-model="readonly" type="checkbox" class="workspace-checkbox" />
                            {{ t('ownership.readonly') }}
                        </label>
                        <p v-if="readonly" class="-mt-2 text-sm text-(--workspace-muted)">
                            {{ t('ownership.readonlyNote') }}
                        </p>

                        <label class="flex min-h-11 items-center gap-2 text-(--workspace-ink)">
                            <input v-model="ownTheme" type="checkbox" class="workspace-checkbox" />
                            {{ t('ownership.ownTheme') }}
                        </label>

                        <div v-if="ownTheme" class="flex flex-col gap-3">
                            <div class="flex flex-col gap-1.5">
                                <span class="text-sm text-(--workspace-muted)">{{ t('ownership.preview') }}</span>
                                <div
                                    role="group"
                                    :aria-label="t('ownership.preview')"
                                    class="inline-flex overflow-hidden rounded-md border border-(--workspace-rule)"
                                >
                                    <button
                                        v-for="mode in [false, true]"
                                        :key="String(mode)"
                                        type="button"
                                        :aria-pressed="previewDark === mode"
                                        :class="[
                                            'editor-focus min-h-11 flex-1 px-3 text-sm transition-colors motion-reduce:transition-none sm:min-h-9',
                                            previewDark === mode
                                                ? 'bg-(--workspace-accent) text-(--workspace-accent-ink)'
                                                : 'text-(--workspace-muted) hover:bg-(--workspace-panel)',
                                        ]"
                                        @click="previewDark = mode"
                                    >
                                        {{ mode ? t('ownership.previewDark') : t('ownership.previewLight') }}
                                    </button>
                                </div>
                            </div>

                            <div class="flex flex-col gap-1.5">
                                <label class="text-sm text-(--workspace-muted)" for="theme-hue">
                                    {{ t('ownership.themeHue') }}
                                </label>
                                <input
                                    id="theme-hue"
                                    v-model.number="editing.hue"
                                    type="range"
                                    min="0"
                                    max="359"
                                    class="workspace-hue"
                                    :disabled="editing.chroma === 0"
                                />
                            </div>

                            <div class="flex flex-col gap-1.5">
                                <label class="text-sm text-(--workspace-muted)" for="theme-chroma">
                                    {{ t('ownership.themeSaturation') }}
                                </label>
                                <input
                                    id="theme-chroma"
                                    v-model.number="editing.chroma"
                                    type="range"
                                    min="0"
                                    max="100"
                                    class="workspace-chroma"
                                />
                                <p class="text-sm text-(--workspace-muted)">
                                    {{ editing.chroma === 0 ? t('ownership.saturationNone') : `${editing.chroma}%` }}
                                </p>
                            </div>

                            <p class="text-sm text-(--workspace-muted)">{{ t('ownership.themeHueHint') }}</p>
                        </div>

                        <label class="flex min-h-11 items-center gap-2 text-(--workspace-ink)">
                            <input v-model="requirePassword" type="checkbox" class="workspace-checkbox" />
                            {{ t('ownership.requirePassword') }}
                        </label>

                        <div v-if="requirePassword" class="flex flex-col gap-1.5">
                            <label class="text-sm text-(--workspace-muted)" for="visitor-password">
                                {{ t('ownership.visitorPassword') }}
                            </label>
                            <input
                                id="visitor-password"
                                v-model="visitorPassword"
                                type="password"
                                autocomplete="new-password"
                                class="workspace-input"
                            />
                            <p v-if="settings.hasVisitorPassword" class="text-sm text-(--workspace-muted)">
                                {{ t('ownership.visitorPasswordKeep') }}
                            </p>
                        </div>
                    </template>

                    <p v-if="error" role="alert" class="text-sm text-(--workspace-warning)">{{ error }}</p>

                    <div class="flex items-center justify-between gap-3">
                        <Link href="/recover" class="text-sm text-(--workspace-muted) underline">
                            {{ t('ownership.forgot') }}
                        </Link>
                        <button
                            type="submit"
                            :disabled="busy"
                            class="editor-focus inline-flex min-h-11 items-center rounded-md bg-(--workspace-accent) px-4 text-sm font-medium text-(--workspace-accent-ink) transition-[filter,opacity] hover:brightness-95 disabled:opacity-60 motion-reduce:transition-none"
                        >
                            {{ settings ? t('ownership.save') : t('ownership.open') }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Teleport>
</template>
