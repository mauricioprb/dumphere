export function normalizeImageUrl(value: string): string | null {
    try {
        const url = new URL(value.trim())

        const localDevelopmentHost = url.hostname === 'localhost'
            || url.hostname === '127.0.0.1'
            || url.hostname === '[::1]'

        if (url.protocol !== 'https:' && !(url.protocol === 'http:' && localDevelopmentHost)) {
            return null
        }

        return url.toString()
    } catch {
        return null
    }
}
