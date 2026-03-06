import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'md-editor-theme'

function getSystemPreference(): Theme {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        return 'dark'
    }
    return 'light'
}

function getStoredTheme(): Theme | null {
    if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(STORAGE_KEY) as Theme | null
    }
    return null
}

const theme = ref<Theme>(getStoredTheme() ?? getSystemPreference())

function applyTheme(t: Theme) {
    if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', t === 'dark')
    }
}

applyTheme(theme.value)

watch(theme, (newTheme) => {
    applyTheme(newTheme)
    localStorage.setItem(STORAGE_KEY, newTheme)
})

export function useTheme() {
    const isDark = ref(theme.value === 'dark')

    watch(theme, (t) => {
        isDark.value = t === 'dark'
    })

    function toggleTheme() {
        theme.value = theme.value === 'dark' ? 'light' : 'dark'
    }

    function setTheme(t: Theme) {
        theme.value = t
    }

    return {
        theme,
        isDark,
        toggleTheme,
        setTheme,
    }
}
