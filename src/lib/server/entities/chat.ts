import { getModelSettings } from '$lib/server/api/openai'
import { calcMessageTokenCosts, calcMessageTokenCount } from '$lib/server/entities/message'
import { prisma } from '$lib/server/prisma'
import { countTokens } from '$lib/server/utils/tokenizer'
import { calcTokenCount } from '$lib/server/utils/tokens'
import { asyncMap, asyncReduce } from '$lib/utils/array'
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
          questionTokenCount: countTokens(question),
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
  return prisma.message.update({
    where: {
      id,
    },
    data: {
      answer,
      answerTokenCount: countTokens(answer),
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

export type ChatWithMessages = Prisma.PromiseReturnType<typeof getChatWithMessagesById>

export const getChatWithMessagesById = (id: number) =>
  prisma.chat.findUniqueOrThrow({
    where: { id },
    include: {
      messages: true,
    },
  })

export const fillMissingChatTokenCount = async (chat: ChatWithMessages) => {
  await prisma.chat.update({
    where: {
      id: chat.id,
    },
    data: {
      roleContentTokenCount: chat.roleContent ? countTokens(chat.roleContent) : 0,
    },
  })

  await Promise.all(chat.messages.map(calcMessageTokenCount))
}

export const calcChatTokenCosts = async (chat: ChatWithMessages) => {
  const chatPricing = getModelSettings(chat.model)

  if (!chatPricing) {
    throw new Error(`No pricing found for model ${chat.model}`)
  }

  const costs = {
    input: chatPricing.input * ((chat.roleContentTokenCount || 0) / 1000),
    output: 0,
  }

  return await asyncReduce(
    chat.messages,
    async (memo, message) => {
      const messageCost = await calcMessageTokenCosts(message, chat)
      return {
        input: memo.input + messageCost.input,
        output: memo.output + messageCost.output,
      }
    },
    costs
  )
}

export const countChatInputTokens = async (chat: ChatWithMessages) => {
  if (
    chat.roleContent.length > 0 &&
    (chat.roleContentTokenCount == null || chat.roleContentTokenCount === 0)
  ) {
    const roleContentTokenCount = calcTokenCount(chat.roleContent)
    await prisma.chat.update({
      where: {
        id: chat.id,
      },
      data: {
        roleContentTokenCount,
      },
    })
    chat.roleContentTokenCount = roleContentTokenCount
  }

  return (
    await asyncMap(chat.messages, async (message) => {
      if (
        message.question.length > 0 &&
        (message.questionTokenCount == null || message.questionTokenCount === 0)
      ) {
        const questionTokenCount = calcTokenCount(message.question)
        await prisma.message.update({
          where: {
            id: message.id,
          },
          data: {
            questionTokenCount,
          },
        })
        message.questionTokenCount = questionTokenCount
      }

      if (
        message.answer &&
        message.answer.length > 0 &&
        (message.answerTokenCount == null || message.answerTokenCount === 0)
      ) {
        const answerTokenCount = calcTokenCount(message.answer)
        await prisma.message.update({
          where: {
            id: message.id,
          },
          data: {
            answerTokenCount,
          },
        })
        message.answerTokenCount = answerTokenCount
      }

      return message
    })
  ).reduce((memo, message) => {
    return memo + (message.questionTokenCount || 0) + (message.answerTokenCount || 0)
  }, chat.roleContentTokenCount || 0)
}
