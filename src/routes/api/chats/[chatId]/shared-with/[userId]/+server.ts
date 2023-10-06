import { getChatWithRelationsById, unshareChatWithUsers } from '$lib/server/entities/chat'
import { json } from '@sveltejs/kit'
import { z, ZodError } from 'zod'
import type { RequestHandler } from './$types'

export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const schema = await z
      .object({
        chatId: z.preprocess(Number, z.number()),
        userId: z.preprocess(Number, z.number()),
      })
      .refine(
        async (data) => {
          const chat = await getChatWithRelationsById(data.chatId)
          return chat.sharedWith.some((user) => user.user.id === data.userId)
        },
        {
          message: 'The chat is not shared with this user.',
          path: ['userId'],
        }
      )
      .parseAsync(params)

    await unshareChatWithUsers(schema.chatId, [schema.userId])
    return json({ message: 'Chat unshared successfully' })
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.flatten().fieldErrors
      return json({ errors }, { status: 422 })
    }

    return json({ error: `${error}` }, { status: 500 })
  }
}
