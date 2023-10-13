import { prisma } from '$lib/server/prisma'
import { countTokens } from '$lib/server/utils/tokenizer'
import type { Prisma } from '.prisma/client'

export type ChatWithRelations = Prisma.PromiseReturnType<typeof getChatWithRelationsById>

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
      sharedWith: {
        include: {
          user: true,
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
}

export const createChat = (userTeamId: number, role = 'You are a helpful assistant.') => {
  return prisma.chat.create({
    data: {
      ownerId: userTeamId,
      roleContent: role,
      roleContentTokenCount: countTokens(role),
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
      sharedWith: {
        include: {
          user: true,
        },
      },
    },
  })
}

export const addQuestionToChat = (id: number, model: string, question: string, userId: number) => {
  return prisma.chat.update({
    // Filtres:
    where: { id },
    // Given data:
    data: {
      model, // Save the model in the chat, so we get the last session selected model if connecting from elsewhere
      messages: {
        create: {
          question,
          model,
          authorId: userId,
          tokenCount: countTokens(question),
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
      sharedWith: {
        include: {
          user: true,
        },
      },
    },
  })
}

export const storeAnswer = (id: number, answer: string, prevTokenCount: number) => {
  return prisma.message.update({
    where: {
      id,
    },
    data: {
      answer,
      tokenCount: prevTokenCount + countTokens(answer),
    },
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

export const forkChat = async (
  chatId: number,
  userId: number,
  activeUserTeamId: number,
  name: string
) => {
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
          authorId: userId,
        })),
      },
      ownerId: activeUserTeamId,
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

export const shareChatWithUsers = async (id: number, emails: string[]) => {
  const usersToShareWith = await prisma.user.findMany({
    where: {
      email: {
        in: emails,
      },
    },
  })

  if (!usersToShareWith.length) {
    return false
  }

  const sharedWithUsers = usersToShareWith.map((user) => ({
    chatId: id,
    userId: user.id,
  }))

  await prisma.chat.update({
    where: {
      id,
    },
    data: {
      shared: true,
    },
  })

  await prisma.chatUser.createMany({
    data: sharedWithUsers,
  })

  return true
}

export const unshareChatWithUsers = async (id: number, usersIds: number[]) => {
  await prisma.chatUser.deleteMany({
    where: {
      chatId: id,
      userId: { in: usersIds },
    },
  })

  const remainingAssociations = await prisma.chatUser.findMany({
    where: {
      chatId: id,
    },
  })

  if (!remainingAssociations.length) {
    await prisma.chat.update({
      where: {
        id,
      },
      data: {
        shared: false,
      },
    })
  }
}
