import type { User } from '@prisma/client'
import { io } from 'socket.io-client'
import { type Writable, writable } from 'svelte/store'

export type BaseSocketUser = {
  id: number
  connected: boolean
  typing: boolean
}

export type SocketUser = User & BaseSocketUser

export const socketUsersStore: Writable<SocketUser[]> = writable([])

export const socketStore = writable(io())
