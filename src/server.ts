import express from 'express'
import http from 'http'
import { handler } from '../build/handler.js'
import injectSocketIO from '../socketIoHandler.js'

const app = express()
const server = http.createServer(app)

// Inject SocketIO
injectSocketIO(server)

// SvelteKit handlers
app.use(handler)
