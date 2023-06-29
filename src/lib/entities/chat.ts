import { prisma } from '$lib/prisma'
import type { Chat } from '@prisma/client'
export type ChatWithRelations = Awaited<ReturnType<typeof getChatWithRelationsById>>

export const getChatWithRelationsById = async (id: number) => {
  return prisma.chat.findUniqueOrThrow({
    where: { id },
    include: {
      owner: {
        include: {
          user: true,
          team: true,
        },
      },
      messages: true,
    },
  })
}

export const getUserChats = async (userId: number) => {
  return prisma.chat.findMany({
    where: {
      owner: {
        user: {
          id: userId,
        },
      },
    },
    include: {
      owner: {
        include: {
          user: true,
          team: true,
        },
      },
    },
  })
}

export const createChat = async (userId: number) => {
  return prisma.chat.create({
    data: {
      name: 'Chat',
      ownerId: userId,
    },
  })
}

export const addMessageToChat = async (chat: Chat, question: string) => {
  return prisma.chat.update({
    where: {
      id: chat.id,
    },
    data: {
      messages: {
        create: {
          question,
        },
      },
    },
    include: {
      owner: {
        include: {
          user: true,
          team: true,
        },
      },
      messages: true,
    },
  })
}

export const storeAnswer = async (id: number, answer: string) => {
  return prisma.message.update({
    where: {
      id,
    },
    data: { answer },
  })
}
