import type { User } from '@prisma/client'
import { writable } from 'svelte/store'
import type { Writable } from 'svelte/store'

export const usersTypingStore: Writable<User[]> = writable([])
export const connectedUsersStore: Writable<User[]> = writable([])
