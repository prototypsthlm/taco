import ioClient from 'socket.io-client'

export const io = ioClient(import.meta.env.VITE_PUBLIC_BASE_URL)
