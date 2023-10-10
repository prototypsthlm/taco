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
      messages: {
        include: {
          author: true,
        },
        orderBy: { createdAt: 'asc' },
      },
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
      messages: {
        include: {
          author: true,
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
}

export const addQuestionToChat = (id: number, model: string, question: string) => {
  return prisma.chat.update({
    // Filtres:
    where: { id },
    // Given data:
    data: {
      model, // Save the model in the chat so we get the last session selected model if connecting from elsewhere
      messages: {
        create: {
          question,
          model,
        },
      },
    },
    // Data that is expected to receive in return:
    include: {
      owner: {
        include: {
          user: true,
          team: true,
        },
      },
      messages: {
        include: {
          author: true,
        },
        orderBy: { createdAt: 'asc' },
      },
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
      messages: {
        include: {
          author: true,
        },
        orderBy: { createdAt: 'asc' },
      },
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

export const forkChat = async (chatId: number, ownerId: number, name: string) => {
  const chat = await getChatWithRelationsById(chatId)

  return prisma.chat.create({
    data: {
      name,
      shared: chat.shared,
      model: chat.model,
      temperature: chat.temperature,
      roleContent: chat.roleContent,
      messages: {
        create: chat.messages.map((x) => ({
          question: x.question,
          answer: x.answer,
        })),
      },
      ownerId,
    },
  })
}

export const countTeamChats = async (id: number) => {
  return prisma.chat.count({
    where: {
      owner: {
        teamId: id,
      },
    },
  })
}

export const getAllTeamChats = async (id: number) => {
  return prisma.chat.findMany({
    where: {
      owner: {
        teamId: id,
      },
    },
    include: {
      messages: true,
    },
  })
}
