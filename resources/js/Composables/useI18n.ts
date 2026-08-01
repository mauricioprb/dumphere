import { ref, computed } from 'vue';
import ptBR from '@/i18n/locales/pt-BR';
import en from '@/i18n/locales/en';

export type Locale = 'pt-BR' | 'en';
export type TranslationKey = keyof typeof ptBR;
export type TranslationFunction = (key: TranslationKey, params?: Record<string, string | number>) => string;

const locales: Record<Locale, Record<string, string>> = {
    'pt-BR': ptBR,
    en: en,
};

const isLocale = (value: string | null): value is Locale => value === 'pt-BR' || value === 'en';

const getBrowserLocale = (): Locale => {
    if (typeof window === 'undefined') return 'pt-BR';

    const browserLang = window.navigator.language.toLowerCase();

    if (browserLang.startsWith('pt')) {
        return 'pt-BR';
    }

    return 'en';
};

const storedLocale = typeof localStorage !== 'undefined' ? localStorage.getItem('md-editor-locale') : null;
const initialLocale: Locale = isLocale(storedLocale) ? storedLocale : getBrowserLocale();
const currentLocale = ref<Locale>(initialLocale);

if (typeof document !== 'undefined') {
    document.documentElement.lang = initialLocale;
    document.documentElement.dir = 'ltr';
}

export function useI18n() {
    const locale = computed({
        get: () => currentLocale.value,
        set: (val: Locale) => {
            currentLocale.value = val;
            localStorage.setItem('md-editor-locale', val);
            document.documentElement.lang = val;
            document.documentElement.dir = 'ltr';
        },
    });

    const t: TranslationFunction = (key, params) => {
        const messages = locales[currentLocale.value] ?? locales['pt-BR'];
        let message = messages[key] ?? key;

        if (params) {
            for (const [k, v] of Object.entries(params)) {
                message = message.replace(`{${k}}`, String(v));
            }
        }

        return message;
    };

    function setLocale(newLocale: Locale) {
        locale.value = newLocale;
    }

    const availableLocales: Locale[] = ['pt-BR', 'en'];

    return {
        t,
        locale,
        setLocale,
        availableLocales,
    };
}
