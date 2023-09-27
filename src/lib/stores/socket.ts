import type { User } from '@prisma/client'
import { writable } from 'svelte/store'
import type { Writable } from 'svelte/store'

export type SocketUser = User & {
  connected: boolean
  typing: boolean
}

export const socketUsersStore: Writable<SocketUser[]> = writable([])
