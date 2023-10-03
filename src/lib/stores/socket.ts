import type { User } from '@prisma/client'
import { writable } from 'svelte/store'
import type { Writable } from 'svelte/store'

export type BaseSocketUser = {
  id: number
  connected: boolean
  typing: boolean
}

export type SocketUser = User & BaseSocketUser

export const socketUsersStore: Writable<SocketUser[]> = writable([])
