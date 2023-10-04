import { deleteChat } from '$lib/server/entities/chat'
import { isUserOwningChat } from '$lib/server/entities/user'
import type { RequestHandler } from '@sveltejs/kit'
import { z, ZodError } from 'zod'
import { json } from '@sveltejs/kit'

export const DELETE: RequestHandler = async ({ locals: { currentUser }, params }) => {
  try {
    const schema = await z
      .preprocess(Number, z.number())
      .refine(async (chatId) => await isUserOwningChat(chatId, currentUser.id), {
        message: `You don't own the chat ${params.chatId}`,
        path: ['chatId'],
      })
      .parseAsync(params.chatId)

    await deleteChat(schema)
    return json({ message: 'Chat deleted successfully' })
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.flatten().fieldErrors
      return json({ errors: errors?.chatId }, { status: 422 })
    }

    return json({ error: `${error}` }, { status: 500 })
  }
}
