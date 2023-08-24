import ioClient from 'socket.io-client'
const ENDPOINT = 'http://localhost:3000'

export const io = ioClient(ENDPOINT)
