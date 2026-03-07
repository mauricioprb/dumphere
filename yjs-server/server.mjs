import http from 'node:http'
import crypto from 'node:crypto'
import { WebSocketServer } from 'ws'
import { setupWSConnection } from 'y-websocket/bin/utils.js'

const HOST = process.env.HOST || '0.0.0.0'
const PORT = parseInt(process.env.PORT || '1234', 10)
const WS_SECRET = process.env.YJS_WS_SECRET || process.env.APP_KEY || ''

if (!WS_SECRET) {
    console.error('[yjs-server] WARNING: No YJS_WS_SECRET or APP_KEY set – token validation disabled!')
}

function verifyToken(token) {
    if (!WS_SECRET) return { valid: true, slug: null }

    try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8')
        const parts = decoded.split(':')

        if (parts.length !== 3) return { valid: false }

        const [slug, expiresAt, signature] = parts
        const now = Math.floor(Date.now() / 1000)

        if (parseInt(expiresAt, 10) < now) {
            return { valid: false, reason: 'expired' }
        }

        const secret = WS_SECRET.startsWith('base64:')
            ? Buffer.from(WS_SECRET.slice(7), 'base64')
            : WS_SECRET

        const expected = crypto
            .createHmac('sha256', secret)
            .update(`${slug}:${expiresAt}`)
            .digest('hex')

        if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
            return { valid: false, reason: 'bad_signature' }
        }

        return { valid: true, slug }
    } catch {
        return { valid: false, reason: 'malformed' }
    }
}

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ status: 'ok' }))
        return
    }
    res.writeHead(404)
    res.end()
})

const wss = new WebSocketServer({ noServer: true })

server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url, `http://${request.headers.host}`)
    const token = url.searchParams.get('token')

    if (!token) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
        return
    }

    const result = verifyToken(token)

    if (!result.valid) {
        console.log(`[yjs-server] Rejected connection: ${result.reason || 'invalid_token'}`)
        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n')
        socket.destroy()
        return
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request)
    })
})

wss.on('connection', (ws, request) => {
    setupWSConnection(ws, request)
})

server.listen(PORT, HOST, () => {
    console.log(`[yjs-server] listening on ${HOST}:${PORT}`)
    console.log(`[yjs-server] token validation: ${WS_SECRET ? 'enabled' : 'DISABLED'}`)
})

