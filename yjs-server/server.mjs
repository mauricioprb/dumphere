// Server entry point — the Dockerfile uses bin/server.js from y-websocket directly.
// This file is kept for local development with `npm start`.
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
require('y-websocket/bin/server.js')

