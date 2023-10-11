import { type Writable, writable } from 'svelte/store'
import type { Notification, NotificationType } from '@prisma/client'

export type NotificationExtended = Omit<Notification, 'type'> & {
  type: NotificationType | 'FLASH'
}

export const notificationStore: Writable<NotificationExtended[]> = writable()
