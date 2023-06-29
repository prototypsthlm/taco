import type { ChatWithRelations } from '$lib/server/entities/chat'
import type { ChatCompletionRequestMessage } from 'openai'
import { Configuration, OpenAIApi } from 'openai'
import { ChatCompletionRequestMessageRoleEnum } from 'openai/api'

const getClient = (apiKey: string) => {
  const configuration = new Configuration({
    apiKey,
  })

  return new OpenAIApi(configuration)
}

export const ask = async (chat: ChatWithRelations) => {
  if (!chat?.owner?.team?.openAiApiKey) {
    throw new Error('Open AI API key is not set!')
  }

  const client = getClient(chat.owner.team.openAiApiKey)

  const messages: ChatCompletionRequestMessage[] = chat.messages.flatMap((message) => {
    const question = [
      { role: ChatCompletionRequestMessageRoleEnum.User, content: message.question },
    ]
    const answer = message.answer
      ? [{ role: ChatCompletionRequestMessageRoleEnum.Assistant, content: message.answer }]
      : []
    return [...question, ...answer]
  })

  try {
    const completion = await client.createChatCompletion({
      model: chat.model,
      messages: [
        { role: ChatCompletionRequestMessageRoleEnum.System, content: chat.roleContent },
        ...messages,
      ],
      temperature: Number(chat.temperature),
    })
  } catch (error) {
    console.error(error)
    throw new Error('Error getting an answer from API: ' + error?.response?.data?.error)
  }

  if (!completion.data.choices[0].message?.content) {
    throw new Error('Error getting an answer from API.')
  }

  return completion.data.choices[0].message.content
}
