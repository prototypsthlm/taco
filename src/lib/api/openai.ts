import type { ChatWithRelations } from '$lib/entities/chat'
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
    return null
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

    return completion.data.choices[0].message?.content
  } catch (e) {
    console.error(e)
  }
}
