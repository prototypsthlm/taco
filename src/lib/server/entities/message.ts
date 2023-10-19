import { getModelSettings } from '$lib/server/api/openai'
import type { ChatWithMessages } from '$lib/server/entities/chat'
import { prisma } from '$lib/server/prisma'
import { countTokens } from '$lib/server/utils/tokenizer'
import type { Chat, Message } from '@prisma/client'

export const deleteMessage = (id: number) => prisma.message.delete({ where: { id } })

export const calcMessageTokenCount = async (message: Message) =>
  prisma.message.update({
    where: {
      id: message.id,
    },
    data: {
      questionTokenCount: message.question ? countTokens(message.question) : 0,
      answerTokenCount: message.answer ? countTokens(message.answer) : 0,
    },
  })

export const calcMessageTokenCosts = async (
  message: ChatWithMessages['messages'][number],
  chat: Chat
) => {
  const messagePricing = getModelSettings(message.model || chat.model)

  if (!messagePricing) {
    throw new Error(
      `No pricing found for message with model: ${message.model} from chat with model: ${chat.model}`
    )
  }

  return {
    input: messagePricing.input * ((message.questionTokenCount || 0) / 1000),
    output: messagePricing.output * ((message.answerTokenCount || 0) / 1000),
  }
}
