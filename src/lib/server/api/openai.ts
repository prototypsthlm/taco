import type { ChatWithRelations } from '$lib/server/entities/chat'
import { setChatName } from '$lib/server/entities/chat'
import { decrypt } from '$lib/server/utils/crypto'
import { countTokens } from '$lib/server/utils/tokenizer'
import { trim } from '$lib/utils/string'
import type { Team } from '@prisma/client'
import * as Sentry from '@sentry/sveltekit'
import {
  type ChatCompletionRequestMessage,
  Configuration,
  type CreateChatCompletionRequest,
  OpenAIApi,
} from 'openai'
import { ChatCompletionRequestMessageRoleEnum } from 'openai/api'

export const getClient = (encryptedApiKey: string) => {
  const configuration = new Configuration({
    apiKey: decryptApiKey(encryptedApiKey),
  })

  return new OpenAIApi(configuration)
}

export const getAvailableModels = async (team: Team) => {
  if (!team.openAiApiKey) {
    throw new Error('API Error: Open AI API key is not set for team')
  }
  const client = getClient(team.openAiApiKey)
  const res = await client.listModels()

  return MODELS.map(
    (x) =>
      ({
        ...x,
        enabled: res.data.data.some((y) => x.id === y.id),
      } as Model)
  )
}

export const generateChatName = async (
  chat: ChatWithRelations,
  newModel: string,
  newTemperature: number
) => {
  if (chat.messages.every((x) => !x.answer)) {
    console.error(
      'API Error: At least one message completed (question and answer) is needed to generate a title.'
    )
    return
  }

  if (!chat?.owner) {
    throw new Error('API Error: Chat doesnt have an chat owner!')
  }

  if (!chat?.owner?.team?.openAiApiKey) {
    throw new Error('API Error: Open AI API key is not set')
  }

  const client = getClient(chat?.owner?.team?.openAiApiKey)

  const res = await client.createChatCompletion(
    transformChatToCompletionRequest(
      chat,
      newModel,
      newTemperature,
      'Main topic of the conversation in no more than 5 words'
    )
  )

  if (!res.data.choices[0].message?.content) {
    console.error('API Error: no content.')
    return
  }

  let name = res.data.choices[0].message.content

  name = trim(name, '"').trim()
  name = trim(name, '.').trim()
  name = trim(name, 'Topic:').trim()

  await setChatName(chat.id, name)
}

export const transformChatToCompletionRequest = (
  chat: ChatWithRelations,
  newModel: string,
  newTemperature: number,
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
    model: newModel,
    messages: [
      { role: ChatCompletionRequestMessageRoleEnum.System, content: chat.roleContent },
      ...messages,
      ...newMessageAsArray,
    ],
    temperature: newTemperature,
    stream,
  }
}

export const decryptApiKey = (encryptedApiKey: string) => {
  if (!process.env.SECRET_KEY) {
    throw new Error(`API Error: You must have SECRET_KEY set in your env.`)
  }

  return decrypt(encryptedApiKey, process.env.SECRET_KEY)
}

export type Model = {
  id: string
  input: number
  output: number
  maxTokens: number
  outputRoom: number
  label: string
  enabled: boolean
}

export const MODELS: Model[] = [
  {
    id: 'gpt-3.5-turbo',
    input: 0.001,
    output: 0.002,
    maxTokens: 4_096,
    outputRoom: 500,
    label: 'GPT-3.5 Turbo',
    enabled: true,
  },
  {
    id: 'gpt-3.5-turbo-16k',
    input: 0.003,
    output: 0.004,
    maxTokens: 16_385,
    outputRoom: 500,
    label: 'GPT-3.5 Turbo 16k',
    enabled: true,
  },
  {
    id: 'gpt-4',
    input: 0.03,
    output: 0.06,
    maxTokens: 8_192,
    outputRoom: 500,
    label: 'GPT-4',
    enabled: true,
  },
  {
    id: 'gpt-4-32k',
    input: 0.06,
    output: 0.12,
    maxTokens: 32_768,
    outputRoom: 500,
    label: 'GPT-4 32k',
    enabled: true,
  },
  {
    id: 'gpt-4-1106-preview',
    input: 0.01,
    output: 0.03,
    maxTokens: 128_000,
    outputRoom: 500,
    label: 'GPT-4 Turbo 128K',
    enabled: true,
  },
]

export const getModel = (id?: string): Model => {
  return MODELS.find((x) => x.id === id) || MODELS[0]
}

export const countMessagesTokens = (messages: ChatCompletionRequestMessage[]) => {
  return (
    countTokens(messages.map((message) => `${message.role}: ${message.content}`).join('\n')) || 0
  )
}

export const retryWithExponentialBackoff = (
  func: (...args: never[]) => Promise<Response>, // Adjusting the type to Promise<Response>
  {
    initialDelay = 1000,
    exponentialBase = 2,
    jitter = true,
    maxRetries = 10,
  }: {
    initialDelay?: number
    exponentialBase?: number
    jitter?: boolean
    maxRetries?: number
  } = {}
): ((...args: never[]) => Promise<Response>) => {
  const retry = async (args: never[], retriesLeft: number, delay: number): Promise<Response> => {
    // console.log('Retries left:', retriesLeft)

    // console.log('Calling function...')
    const response = await func(...args)
    // console.log('Function returned with status:', response.status)

    if (response.status === 429 && retriesLeft > 0) {
      // console.log('Waiting for', delay, 'milliseconds...')

      await new Promise((resolve) => setTimeout(resolve, delay))
      // console.log('Waited for', delay, 'milliseconds...')

      Sentry.captureException(
        new Error('retryWithExponentialBackoff OpenAI API Error: 429 Too many requests'),
        {
          extra: {
            retriesLeft,
            delay,
            exponentialBase,
            jitter,
            maxRetries,
          },
        }
      )

      return retry(
        args,
        retriesLeft - 1,
        delay * exponentialBase * (1 + (jitter ? Math.random() : 0))
      )
    }
    return response
  }

  return (...args: never[]) => retry(args, maxRetries, initialDelay)
}
