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
        const myState = awareness.getLocalState()

        if (myState && myState.user) {
            const myName = myState.user.name
            let hasCollision = false

            states.forEach((state: any, clientId: number) => {
                if (clientId !== ydoc.clientID && state?.user?.name === myName) {
                    if (ydoc.clientID > clientId) {
                        hasCollision = true
                    }
                }
            })

            if (hasCollision) {
                const usedNames = Array.from(states.values())
                    .map((s: any) => s?.user?.name)
                    .filter(Boolean)

                const newName = generateUniqueName(usedNames)
                localStorage.setItem(USERNAME_STORAGE_KEY, newName)

                awareness.setLocalStateField('user', {
                    ...myState.user,
                    name: newName
                })
                return
            }
        }

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
    let host = import.meta.env.VITE_YJS_WS_HOST
    const port = import.meta.env.VITE_YJS_WS_PORT ?? '1234'
    let scheme = import.meta.env.VITE_YJS_WS_SCHEME
    const path = import.meta.env.VITE_YJS_WS_PATH ?? ''

    if (!host || host === 'localhost') {
        host = window.location.hostname
    }

    if (!scheme) {
        scheme = window.location.protocol === 'https:' ? 'wss' : 'ws'
    }

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

    const name = generateUniqueName([])
    localStorage.setItem(USERNAME_STORAGE_KEY, name)
    return name
}

function generateUniqueName(usedNames: string[]): string {
    const names = [
        'Albert Einstein', 'Isaac Newton', 'Nikola Tesla', 'Marie Curie',
        'Richard Feynman', 'Niels Bohr', 'Stephen Hawking', 'Max Planck',
        'Erwin Schrödinger', 'Werner Heisenberg', 'Lise Meitner', 'Enrico Fermi',
        'Chien-Shiung Wu', 'Ada Lovelace', 'Alan Turing', 'Carl Gauss',
        'Leonhard Euler', 'Blaise Pascal', 'Hypatia', 'Emmy Noether',
        'Ramanujan', 'Katherine Johnson', 'Mary Jackson', 'Dorothy Vaughan',
        'Santos Dumont', 'Leonardo da Vinci', 'Thomas Edison', 'Hedy Lamarr',
        'Alexander Bell', 'Guglielmo Marconi', 'Nikolaus Otto', 'George Washington Carver',
        'Charles Darwin', 'Rosalind Franklin', 'Gregor Mendel', 'Louis Pasteur',
        'Dmitri Mendeleev', 'Linus Pauling', 'Barbara McClintock', 'Jane Goodall',
        'Rachel Carson', 'Alexander Fleming', 'Galileo Galilei', 'Johannes Kepler',
        'Carl Sagan', 'Vera Rubin', 'Edwin Hubble', 'Copérnico',
        'Neil deGrasse Tyson', 'Jocelyn Bell Burnell', 'Grace Hopper', 'John von Neumann',
        'Claude Shannon', 'Tim Berners-Lee', 'Linus Torvalds', 'Dennis Ritchie',
        'Margaret Hamilton', 'Donald Knuth', 'César Lattes', 'Johanna Döbereiner',
        'Vital Brazil', 'Carlos Chagas', 'Mário Schenberg', 'Oswaldo Cruz',
        'Nise da Silveira', 'Milton Santos', 'Enedina Alves Marques', 'Ayrton Senna',
        'Machado de Assis', 'Tarsila do Amaral'
    ]

    const availableNames = names.filter(name => !usedNames.includes(name))

    if (availableNames.length === 0) {
        const fallbackName = names[Math.floor(Math.random() * names.length)]
        return `${fallbackName} ${Math.floor(Math.random() * 1000)}`
    }

    return availableNames[Math.floor(Math.random() * availableNames.length)]
}
