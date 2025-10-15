import { prisma } from '$lib/server/prisma'
import { Message, Prisma } from '@prisma/client'
import { decryptString, encryptString } from '../utils/crypto'

export const decryptMessages = (messages: Message[]): Message[] => {
  try {
    const decryptedMessages = messages.map((message) => {
      return {
        ...message,
        question: decryptString(message.question),
        answer: message.answer ? decryptString(message.answer) : null,
      }
    })

    return decryptedMessages
  } catch (error) {
    throw new Error('Error decrypting chat')
  }
}

export const encryptMessages = (messages: Message[]): Message[] => {
  try {
    const encryptedMessages = messages.map((message) => {
      return {
        ...message,
        question: encryptString(message.question),
        answer: message.answer ? encryptString(message.answer) : null,
      }
    })

    return encryptedMessages
  } catch (error) {
    throw new Error('Error encrypting chat')
  }
}

export type ChatWithOwner = Prisma.ChatGetPayload<{
  include: {
    owner: {
      include: {
        user: true
        team: true
      }
    }
  }
}>

export type ChatWithMessages = Prisma.ChatGetPayload<{
  include: {
    messages: true
  }
}>

export type ChatWithSharedWith = Prisma.ChatGetPayload<{
  include: {
    sharedWith: {
      include: {
        user: true
      }
    }
  }
}>

export type ChatWithRelations = ChatWithOwner & ChatWithMessages & ChatWithSharedWith

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

  const decrypted = {
    ...response,
    name: response.name ? decryptString(response.name) : null,
    messages: decryptMessages(response.messages),
  }

  return decrypted
}

export const createChat = (userTeamId: number, role = 'You are a helpful assistant.') => {
  return prisma.chat.create({
    data: {
      ownerId: userTeamId,
      roleContent: role,
      encrypted: true,
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

export const addQuestionToChat = async (
  id: number,
  model: string,
  temperature: number,
  question: string,
  userId: number
) => {
  const encryptedQuestion = encryptString(question)

  const updateResponse = await prisma.chat.update({
    where: { id },
    data: {
      model,
      temperature: temperature.toString(),
      messages: {
        create: {
          question: encryptedQuestion,
          model,
          temperature: temperature.toString(),
          authorId: userId,
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

  const decrypted = {
    ...updateResponse,
    name: updateResponse.name ? decryptString(updateResponse.name) : null,
    messages: decryptMessages(updateResponse.messages),
  }

  return decrypted
}

export const storeAnswer = (id: number, answer: string) => {
  const encryptedAnswer = encryptString(answer)
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
  const encryptedName = encryptString(name)
  return prisma.chat.update({
    where: {
      id,
    },
    data: { name: encryptedName },
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
      encrypted: chat.encrypted,
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

  const decryptedChats = response.map((chat) => {
    if (chat.encrypted) {
      return {
        ...chat,
        name: chat.name ? decryptString(chat.name) : null,
        messages: decryptMessages(chat.messages),
      }
    }

    return chat
  })

  return decryptedChats
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
