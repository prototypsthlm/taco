import { prisma } from '$lib/server/prisma'

export const deleteMessage = (id: number) => prisma.message.delete({ where: { id } })
