interface WebSocketEnvironment {
    host?: string
    port?: string
    scheme?: string
    path?: string
}

interface BrowserLocation {
    hostname: string
    protocol: string
}

export function buildWebSocketUrl(
    environment: WebSocketEnvironment,
    location: BrowserLocation = window.location,
): string {
    const configuredHost = clean(environment.host)
    const configuredPort = clean(environment.port)
    const configuredScheme = clean(environment.scheme)
    const configuredPath = clean(environment.path)
    const localBrowser = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    const useBrowserHost = !configuredHost || configuredHost === 'localhost' || configuredHost === '127.0.0.1'
    const host = useBrowserHost ? location.hostname : configuredHost
    const scheme = configuredScheme || (location.protocol === 'https:' ? 'wss' : 'ws')
    const port = configuredPort || (localBrowser && useBrowserHost ? '1234' : '')
    const path = configuredPath || (localBrowser && useBrowserHost ? '' : '/yjs-ws/')
    const defaultPort = (scheme === 'wss' && port === '443') || (scheme === 'ws' && port === '80')
    const portSuffix = defaultPort || !port ? '' : `:${port}`
    const pathPrefix = path ? `/${path.replace(/^\/+|\/+$/g, '')}` : ''

    return `${scheme}://${host}${portSuffix}${pathPrefix}`
}

function clean(value: string | undefined): string {
    return value?.trim() ?? ''
}
