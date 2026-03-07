import { ref, onUnmounted } from 'vue'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'
import { useDocumentStore } from '@/Stores/documentStore'

export function useYjsProvider(slug: string, wsToken: string) {
    const store = useDocumentStore()

    const ydoc = new Y.Doc()

    const yXmlFragment = ydoc.getXmlFragment('document')

    const wsUrl = buildWsUrl()

    const wsProvider = new WebsocketProvider(wsUrl, `document-${slug}`, ydoc, {
        connect: true,
        maxBackoffTime: 10000,
        params: { token: wsToken },
    })

    const awareness = wsProvider.awareness

    const userColor = randomColor()
    const userName = getOrCreateUserName()

    awareness.setLocalStateField('user', {
        name: userName,
        color: userColor,
    })

    const isConnected = ref(wsProvider.wsconnected)

    wsProvider.on('status', (event: { status: string }) => {
        isConnected.value = event.status === 'connected'
        store.setConnected(event.status === 'connected')
    })

    awareness.on('change', () => {
        const states = awareness.getStates()
        const users = Array.from(states.entries())
            .filter(([clientId, state]) => {
                if (clientId === ydoc.clientID) return false
                if (!state || !state.user) return false
                return true
            })
            .map(([clientId, state]) => ({
                id: String(clientId),
                name: (state as any).user.name ?? 'Anonymous',
                color: (state as any).user.color ?? '#888',
            }))
        store.setUsers(users)
    })

    const indexeddbPersistence = new IndexeddbPersistence(`md-editor-${slug}`, ydoc)

    const whenSynced = new Promise<void>((resolve) => {
        if (indexeddbPersistence.synced) {
            resolve()
        } else {
            indexeddbPersistence.once('synced', () => resolve())
        }
    })

    indexeddbPersistence.on('synced', () => {
        console.log(`[Yjs] IndexedDB synced for "${slug}"`)
    })

    const handleBeforeUnload = () => {
        awareness.setLocalState(null)
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    onUnmounted(() => {
        window.removeEventListener('beforeunload', handleBeforeUnload)
        awareness.setLocalState(null)
        store.setUsers([])
        wsProvider.disconnect()
        wsProvider.destroy()
        indexeddbPersistence.destroy()
        ydoc.destroy()
    })

    return {
        ydoc,
        yXmlFragment,
        wsProvider,
        awareness,
        isConnected,
        userName,
        userColor,
        whenSynced,
    }
}

function buildWsUrl(): string {
    const host = import.meta.env.VITE_YJS_WS_HOST ?? 'localhost'
    const port = import.meta.env.VITE_YJS_WS_PORT ?? '1234'
    const scheme = import.meta.env.VITE_YJS_WS_SCHEME ?? 'ws'
    const path = import.meta.env.VITE_YJS_WS_PATH ?? ''

    const isDefaultPort = (scheme === 'wss' && port === '443') || (scheme === 'ws' && port === '80')
    const portSuffix = isDefaultPort || !port ? '' : `:${port}`

    return `${scheme}://${host}${portSuffix}${path}`
}

function randomColor(): string {
    const colors = [
        '#C62828', '#AD1457', '#6A1B9A', '#4527A0',
        '#283593', '#1565C0', '#00695C', '#2E7D32',
        '#558B2F', '#E65100', '#D84315', '#4E342E',
        '#37474F'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
}

const USERNAME_STORAGE_KEY = 'md-editor-username'

function getOrCreateUserName(): string {
    const stored = localStorage.getItem(USERNAME_STORAGE_KEY)
    if (stored) return stored

    const name = generateCreativeName()
    localStorage.setItem(USERNAME_STORAGE_KEY, name)
    return name
}

function generateCreativeName(): string {
    const scientists = [
        // Físicos
        'Albert Einstein',
        'Isaac Newton',
        'Nikola Tesla',
        'Marie Curie',
        'Richard Feynman',
        'Niels Bohr',
        'Stephen Hawking',
        'Max Planck',
        'Erwin Schrödinger',
        'Werner Heisenberg',
        // Matemáticos
        'Ada Lovelace',
        'Alan Turing',
        'Carl Gauss',
        'Leonhard Euler',
        'Blaise Pascal',
        'Hypatia',
        'Emmy Noether',
        'Ramanujan',
        // Inventores & Engenheiros
        'Santos Dumont',
        'Leonardo da Vinci',
        'Thomas Edison',
        'Hedy Lamarr',
        'Alexander Bell',
        'Guglielmo Marconi',
        // Biólogos & Químicos
        'Charles Darwin',
        'Rosalind Franklin',
        'Gregor Mendel',
        'Louis Pasteur',
        'Dmitri Mendeleev',
        'Linus Pauling',
        'Barbara McClintock',
        // Astrônomos
        'Galileo Galilei',
        'Johannes Kepler',
        'Carl Sagan',
        'Vera Rubin',
        'Edwin Hubble',
        // Computação
        'Grace Hopper',
        'John von Neumann',
        'Claude Shannon',
        'Tim Berners-Lee',
        'Linus Torvalds',
        'Dennis Ritchie',
        'Margaret Hamilton',
        // Brasileiros
        'César Lattes',
        'Johanna Döbereiner',
        'Vital Brazil',
        'Carlos Chagas',
        'Mário Schenberg',
    ]

    return scientists[Math.floor(Math.random() * scientists.length)]
}
