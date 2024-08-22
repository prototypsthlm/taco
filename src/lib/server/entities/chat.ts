import { prisma } from '$lib/server/prisma'
import { decrypt, encrypt } from '$lib/server/utils/crypto'
import type { Prisma } from '.prisma/client'

export type ChatWithRelations = Prisma.PromiseReturnType<typeof getChatWithRelationsById>

const encryptMessage = (message: string) => {
  const secretKey = process.env.SECRET_KEY

  if (!secretKey) {
    throw new Error('Secret key not found')
  }

  return encrypt(message, secretKey)
}

const decryptMessage = (message: string) => {
  const secretKey = process.env.SECRET_KEY

  if (!secretKey) {
    throw new Error('Secret key not found')
  }

  return decrypt(message, secretKey)
}

export const getChatWithRelationsById = async (id: number) => {
  const response = await prisma.chat.findUniqueOrThrow({
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

  const decryptedMessages = response.messages.map((message) => {
    if (!message.encrypted) {
      return message
    }
    return {
      ...message,
      question: decryptMessage(message.question),
      answer: message.answer ? decryptMessage(message.answer) : null,
    }
  })

  const responseWithDecryptedMessages = {
    ...response,
    messages: decryptedMessages,
  }

  return responseWithDecryptedMessages
}

export const createChat = (userTeamId: number, role = 'You are a helpful assistant.') => {
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
      sharedWith: {
        include: {
          user: true,
        },
      },
    },
  })
}

export const addQuestionToChat = (
  id: number,
  model: string,
  temperature: number,
  question: string,
  userId: number
) => {
  const encryptedQuestion = encryptMessage(question)

  return prisma.chat.update({
    // Filtres:
    where: { id },
    // Given data:
    data: {
      model, // Save the model in the chat, so we get the last session selected model if connecting from elsewhere
      temperature: temperature.toString(), // Save the temperature in the chat, so we get the last session selected temperature if connecting from elsewhere
      messages: {
        create: {
          question: encryptedQuestion,
          model,
          temperature: temperature.toString(),
          authorId: userId,
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

export const storeAnswer = (id: number, answer: string) => {
  const encryptedAnswer = encryptMessage(answer)
  return prisma.message.update({
    where: {
      id,
    },
    data: {
      answer: encryptedAnswer,
    },
  })
}

export const setChatName = (id: number, name: string) => {
  return prisma.chat.update({
    where: {
      id,
    },
    data: { name },
  })
}

export const deleteChat = (id: number) => {
  return prisma.chat.delete({
    where: {
      id,
    },
  })
}

export const cloneChat = async (
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
      temperature: chat.temperature.toString(),
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
  const response = await prisma.chat.findMany({
    where: {
      owner: {
        teamId: id,
      },
    },
    include: {
      messages: true,
    },
  })

  return response
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
