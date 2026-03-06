import { ref, onUnmounted } from 'vue'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'
import { useDocumentStore } from '@/Stores/documentStore'

export function useYjsProvider(slug: string) {
    const store = useDocumentStore()

    const ydoc = new Y.Doc()

    const yXmlFragment = ydoc.getXmlFragment('document')

    const wsUrl = buildWsUrl()

    const wsProvider = new WebsocketProvider(wsUrl, `document-${slug}`, ydoc, {
        connect: true,
        maxBackoffTime: 10000,
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
            .filter(([clientId]) => clientId !== ydoc.clientID)
            .map(([clientId, state]) => ({
                id: String(clientId),
                name: (state as any).user?.name ?? 'Anonymous',
                color: (state as any).user?.color ?? '#888',
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

    onUnmounted(() => {
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

    return `${scheme}://${host}:${port}`
}

function randomColor(): string {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
        '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
        '#BB8FCE', '#85C1E9', '#F1948A', '#82E0AA',
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
