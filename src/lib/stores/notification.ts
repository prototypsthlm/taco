import { generateRandomInt } from '$lib/utils/number'
import type { Notification } from '@prisma/client'
import { type Writable, writable } from 'svelte/store'

export type FlashNotification = {
  id: number
  type: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO'
  category: string
  title: string
  body: string
  createdAt: Date
}

export const notificationStore: Writable<Notification[]> = writable([])
export const flashNotificationStore: Writable<FlashNotification[]> = writable([])

export const addFlashNotification = (
  title: string,
  body: string,
  {
    type = 'INFO',
    category = 'GENERAL',
  }: {
    type?: FlashNotification['type']
    category?: string
  } = {}
) => {
  flashNotificationStore.update((notifications) => {
    notifications.push({
      id: generateRandomInt(),
      type,
      category,
      title,
      body,
      createdAt: new Date(),
    })
    return notifications
  })
}

export const removeFlashNotificationOfCategory = (category: string) => {
  flashNotificationStore.update((ns) => ns.filter((n) => n.category !== category))
}
