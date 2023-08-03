import { prisma } from '$lib/server/prisma'
export type ChatWithRelations = Awaited<ReturnType<typeof getChatWithRelationsById>>

export const getChatWithRelationsById = (id: number) => {
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

export const createChat = (userTeamId: number, role: string | undefined) => {
  return prisma.chat.create({
    data: {
      ownerId: userTeamId,
      roleContent: role,
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

export const addMessageToChat = (chat: ChatWithRelations, question: string) => {
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

export const storeAnswer = (id: number, answer: string) => {
  return prisma.message.update({
    where: {
      id,
    },
    data: { answer },
  })
}

export const setChatName = (id: number, name: string) => {
  return prisma.chat.update({
    where: {
      id,
    },
    data: { name },
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

export const deleteChat = (id: number) => {
  return prisma.chat.delete({
    where: {
      id,
    },
  })
}
