import { addMessageToChat, createChat } from '$lib/entities/chat'
import type { Chat } from '@prisma/client'
import { fail, redirect } from '@sveltejs/kit'
import { z, ZodError } from 'zod'
import type { Actions } from './$types'

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const data = Object.fromEntries(await request.formData())
    console.log(data)
    let schema
    try {
      schema = z
        .object({
          message: z.string(),
        })
        .parse(data)
    } catch (error) {
      console.error(error)
      if (error instanceof ZodError) {
        const errors = error.flatten().fieldErrors

        return fail(422, {
          data,
          errors,
        })
      }
      return fail(500, {
        data,
        error,
      })
    }
    const currentChat: Chat = await createChat(locals.currentUser.id)

    const chatWithQuestion = await addMessageToChat(currentChat, schema.message)

    throw redirect(301, `/app/chat/${chatWithQuestion.id}`)
  },
}
