import { setChatName } from '$lib/server/entities/chat'
import type { ChatWithRelations } from '$lib/server/entities/chat'
import { decrypt } from '$lib/server/utils/crypto'
import { trim } from '$lib/utils/string'
import type { ChatCompletionRequestMessage, CreateChatCompletionRequest } from 'openai'
import { Configuration, OpenAIApi } from 'openai'
import { ChatCompletionRequestMessageRoleEnum } from 'openai/api'

export const getClient = (chat: ChatWithRelations) => {
  if (!chat?.owner?.team?.openAiApiKey) {
    throw new Error('API Error: Open AI API key is not set!')
  }

  if (!process.env.SECRET_KEY) {
    throw new Error('API Error: You must have SECRET_KEY set in your env.')
  }

  const configuration = new Configuration({
    apiKey: decrypt(chat.owner.team.openAiApiKey, process.env.SECRET_KEY),
  })

  return new OpenAIApi(configuration)
}

export const generateChatName = async (chat: ChatWithRelations, newModel: string) => {
  if (chat.messages.every((x) => !x.answer)) {
    console.error(
      'API Error: At least one message completed (question and answer) is needed to generate a title.'
    )
    return chat
  }

  const client = getClient(chat)

  const res = await client.createChatCompletion(
    transformChatToCompletionRequest(chat, newModel, 'Main topic of the conversation in no more than 5 words')
  )

  if (!res.data.choices[0].message?.content) {
    console.error('API Error: no content.')
    return chat
  }

  let name = res.data.choices[0].message.content

  name = trim(name, '"').trim()
  name = trim(name, '.').trim()
  name = trim(name, 'Topic:').trim()

  return setChatName(chat.id, name)
}

export const transformChatToCompletionRequest = (
  chat: ChatWithRelations,
  newModel: string,
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
    model: newModel, // A given model choosen for each message is used.
    messages: [
      { role: ChatCompletionRequestMessageRoleEnum.System, content: chat.roleContent },
      ...messages,
      ...newMessageAsArray,
    ],
    temperature: Number(chat.temperature),
    stream,
  }
}

export const getApiKey = (chat: ChatWithRelations) => {
  if (!chat?.owner?.team?.openAiApiKey) {
    throw new Error('API Error: Open AI API key is not set')
  }

  if (!process.env.SECRET_KEY) {
    throw new Error(`API Error: You must have SECRET_KEY set in your env.`)
  }

  return decrypt(chat.owner.team.openAiApiKey, process.env.SECRET_KEY)
}
