import { type Writable, writable } from 'svelte/store'
import type { Notification } from '@prisma/client'

export const notificationStore: Writable<Notification[]> = writable()
