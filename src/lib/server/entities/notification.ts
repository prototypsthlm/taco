import { prisma } from '$lib/server/prisma'

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
