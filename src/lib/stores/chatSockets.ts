import { writable } from 'svelte/store'
import type { Writable } from 'svelte/store'

export const usersTypingStore: Writable<string[]> = writable([])
export const connectedUsersStore: Writable<string[]> = writable([])
