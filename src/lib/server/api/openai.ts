import type { ChatWithRelations } from '$lib/server/entities/chat'
import { decrypt } from '$lib/server/utils/crypto'
import type { ChatCompletionRequestMessage, CreateChatCompletionRequest } from 'openai'
import { Configuration, OpenAIApi } from 'openai'
import { ChatCompletionRequestMessageRoleEnum } from 'openai/api'

export const getClient = (chat: ChatWithRelations) => {
  if (!chat?.owner?.team?.openAiApiKey) {
    throw new Error('Open AI API key is not set!')
  }

  if (!process.env.SECRET_KEY) {
    throw new Error('You must have SECRET_KEY set in your env.')
  }

  const configuration = new Configuration({
    apiKey: decrypt(chat.owner.team.openAiApiKey, process.env.SECRET_KEY),
  })

  return new OpenAIApi(configuration)
}

export const ask = async (chat: ChatWithRelations) => {
  const client = getClient(chat)

  try {
    const res = await client.createChatCompletion(transformChatToCompletionRequest(chat))

    if (!res.data.choices[0].message?.content) {
      throw new Error('Error getting an answer from API. Message has no content.')
    }

    return res.data.choices[0].message.content
  } catch (error) {
    console.error(error)
    throw new Error(`Error getting an answer from API: ${error}`)
  }
}

export const generateChatName = async (chat: ChatWithRelations) => {
  if (chat.messages.every((x) => !x.answer)) {
    throw new Error(
      'At least one message completed (question and answer) is needed to generate a title.'
    )
  }

  const client = getClient(chat)

  const res = await client.createChatCompletion(
    transformChatToCompletionRequest(chat, 'Main topic of the conversation in no more than 5 words')
  )

  if (!res.data.choices[0].message?.content) {
    throw new Error('Something went wrong')
  }

  return res.data.choices[0].message.content
}

export const transformChatToCompletionRequest = (
  chat: ChatWithRelations,
  newMessage?: string,
  stream = false
): CreateChatCompletionRequest => {
  const messages: ChatCompletionRequestMessage[] = chat.messages.flatMap((message) => {
    const question = [
      { role: ChatCompletionRequestMessageRoleEnum.User, content: message.question },
    ]
    const answer = message.answer
      ? [{ role: ChatCompletionRequestMessageRoleEnum.Assistant, content: message.answer }]
      : []
    return [...question, ...answer]
  })

  const newMessageAsArray = newMessage
    ? [
        {
          role: ChatCompletionRequestMessageRoleEnum.User,
          content: newMessage,
        },
      ]
    : []

  return {
    model: chat.model,
    messages: [
      { role: ChatCompletionRequestMessageRoleEnum.System, content: chat.roleContent },
      ...messages,
      ...newMessageAsArray,
    ],
    temperature: Number(chat.temperature),
    stream,
  }
}
