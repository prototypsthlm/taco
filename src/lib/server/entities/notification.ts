import { prisma } from '$lib/server/prisma'
import { NotificationType } from '@prisma/client'

export const markAsRead = async (id: number) =>
  prisma.notification.update({
    where: {
      id,
    },
    data: {
      read: true,
    },
  })

export const doesNotificationBelongToUser = async (id: number, userId: number) => {
  const n = await prisma.notification.findUnique({
    where: {
      id,
      userId,
    },
  })

  return !!n
}

export const createNotification = async (
  title: string,
  body: string,
  userId: number,
  type: NotificationType
) => prisma.notification.create({ data: { type, title, body, userId } })

export const markVerifyNotificationAsRead = (userId: number) => {
  return prisma.notification.updateMany({
    where: {
      type: NotificationType.VERIFY_EMAIL,
      userId,
    },
    data: {
      read: true,
    },
  })
}
