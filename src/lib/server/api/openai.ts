import type { ChatWithRelations } from '$lib/server/entities/chat'
import { setChatName } from '$lib/server/entities/chat'
import { decrypt } from '$lib/server/utils/crypto'
import { countTokens } from '$lib/server/utils/tokenizer'
import { Models } from '$lib/types/models'
import { trim } from '$lib/utils/string'
import type { Team } from '@prisma/client'
import {
  type ChatCompletionRequestMessage,
  Configuration,
  type CreateChatCompletionRequest,
  OpenAIApi,
} from 'openai'
import { ChatCompletionRequestMessageRoleEnum } from 'openai/api'
import * as Sentry from '@sentry/sveltekit'

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
  // From all the received available OpenAI models, get only the ones we are interested in, the ones listed in Models from models.ts.
  const availableModels: string[] = []
  for (let i = 0; i < res.data.data.length; i++) {
    const modelId = res.data.data[i]['id']
    if (Object.values(Models).includes(modelId as Models)) {
      availableModels.push(modelId)
    }
  }
  return availableModels
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
    model: newModel, // A given model chosen for each message is used.
    messages: [
      { role: ChatCompletionRequestMessageRoleEnum.System, content: chat.roleContent },
      ...messages,
      ...newMessageAsArray,
    ],
    temperature: newTemperature, // A given temperature chosen for each message is used.
    stream,
  }
}

export const decryptApiKey = (encryptedApiKey: string) => {
  if (!process.env.SECRET_KEY) {
    throw new Error(`API Error: You must have SECRET_KEY set in your env.`)
  }

  return decrypt(encryptedApiKey, process.env.SECRET_KEY)
}

export const SETTINGS = [
  {
    model: 'gpt-4',
    input: 0.03,
    output: 0.06,
    maxTokens: 8_192,
    outputRoom: 500,
  },
  {
    model: 'gpt-4-32k',
    input: 0.06,
    output: 0.12,
    maxTokens: 32_768,
    outputRoom: 500,
  },
  {
    model: 'gpt-3.5-turbo',
    input: 0.0015,
    output: 0.002,
    maxTokens: 4_097,
    outputRoom: 500,
  },
  {
    model: 'gpt-3.5-turbo-16k',
    input: 0.003,
    output: 0.004,
    maxTokens: 16_385,
    outputRoom: 500,
  },
]

export const getModelSettings = (model: string) => {
  return SETTINGS.find((x) => x.model === model) || SETTINGS[2]
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
