import type { ChatWithRelations } from '$lib/server/entities/chat'
import { setChatName } from '$lib/server/entities/chat'
import { decrypt } from '$lib/server/utils/crypto'
import { countTokens } from '$lib/server/utils/tokenizer'
import { trim } from '$lib/utils/string'
import type { Team } from '@prisma/client'
import * as Sentry from '@sentry/sveltekit'
import OpenAI from 'openai'
import type {
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
  ChatCompletion,
} from 'openai/resources'

export const getClient = (encryptedApiKey: string) => {
  return new OpenAI({
    apiKey: decryptApiKey(encryptedApiKey),
  })
}
const getOpenAiModels = async (openAiApiKey: string): Promise<any[]> => {
  const client = getClient(openAiApiKey)
  const res = await client.models.list()
  return res.data
}

export const getOllamaModelsList = async (ollamaBaseUrl: string) => {
  const res = await fetch(`${ollamaBaseUrl}/api/tags`)
  const data = await res.json()
  let modelList: Model[] = []
  data.models.map((model: any) => {
    modelList.push({
      id: model.name,
      input: 0.001,
      output: 0.002,
      maxTokens: 4_096,
      outputRoom: 500,
      label: model.name,
      enabled: true,
    })
  })
  return modelList
}

export const getAvailableModels = async (team: Team) => {
  let availableModels: Model[] = []
  let allModelsFromOpenAi: any[] = []
  if (!team.openAiApiKey && !team.ollamaBaseUrl) {
    throw new Error('API Error: Open AI API key is not set for team')
  }
  if (team.openAiApiKey) {
    allModelsFromOpenAi = [...allModelsFromOpenAi, ...(await getOpenAiModels(team.openAiApiKey))]
    MODELS.map(
      (x) =>
        ({
          ...x,
          enabled: allModelsFromOpenAi.some((y) => x.id === y.id),
        } as Model)
    )
    availableModels = MODELS
  }
  if (team.ollamaBaseUrl) {
    availableModels = [...availableModels, ...(await getOllamaModelsList(team.ollamaBaseUrl))]
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

  const res = (await client.chat.completions.create(
    transformChatToCompletionRequest(
      chat,
      newModel,
      newTemperature,
      'Main topic of the conversation in no more than 5 words'
    )
  )) as ChatCompletion

  if (!res.choices[0].message?.content) {
    console.error('API Error: no content.')
    return
  }

  let name = res.choices[0].message.content

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
): ChatCompletionCreateParams => {
  const messages = chat.messages.flatMap((message) => {
    const question = [{ role: 'user', content: message.question }]
    const answer = message.answer ? [{ role: 'assistant', content: message.answer }] : []
    return [...question, ...answer]
  }) as ChatCompletionMessageParam[]

  const newMessageAsArray = (
    newMessage
      ? [
          {
            role: 'user',
            content: newMessage,
          },
        ]
      : []
  ) as ChatCompletionMessageParam[]

  return {
    model: newModel,
    messages: [{ role: 'system', content: chat.roleContent }, ...messages, ...newMessageAsArray],
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

export const countMessagesTokens = (messages: ChatCompletionMessageParam[]) => {
  return (
    countTokens(messages.map((message) => `${message.role}: ${message.content}`).join('\n')) || 0
  )
}

export const retryWithExponentialBackoff = (
  func: (...args: never[]) => Promise<Response>,
  {
    initialDelay = 100,
    exponentialBase = 1.5,
    maxRetries = 10,
    jitter = true,
    jitterFactor = 0.1,
  }: {
    initialDelay?: number
    exponentialBase?: number
    maxRetries?: number
    jitter?: boolean
    jitterFactor?: number
  } = {}
): ((...args: never[]) => Promise<Response>) => {
  const retry = async (args: never[], retriesLeft: number, delay: number): Promise<Response> => {
    // console.log('Retries left:', retriesLeft)

    // console.log('Calling function...')
    const response = await func(...args)
    // console.log('Function returned with status:', response.status)

    if (response.status === 429 && retriesLeft > 0) {
      // console.log(`Waiting for ${(delay / 1000).toFixed(2)} seconds...`)

      await new Promise((resolve) => setTimeout(resolve, delay))
      // console.log(`Waited for ${(delay / 1000).toFixed(2)} seconds...`)

      Sentry.captureException(
        new Error('retryWithExponentialBackoff OpenAI API Error: 429 Too many requests'),
        {
          extra: {
            retriesLeft,
            delay,
            exponentialBase,
            maxRetries,
            jitter,
            jitterFactor,
          },
        }
      )

      const nextDelay =
        delay * exponentialBase + (jitter ? delay * Math.random() * jitterFactor : 0)

      return retry(args, retriesLeft - 1, nextDelay)
    }
    return response
  }

  return (...args: never[]) => retry(args, maxRetries, initialDelay)
}
