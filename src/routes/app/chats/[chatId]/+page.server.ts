import { forkChat, getChatWithRelationsById } from '$lib/server/entities/chat'
import { type Actions, fail, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const chatId = Number(params.chatId)

  return {
    chatId,
    chat: getChatWithRelationsById(chatId),
  }
}

export const actions: Actions = {
  forkChat: async ({ locals: { currentUser }, request }) => {
    const fields = Object.fromEntries(await request.formData())

    const schema = z
      .object({
        chatId: z.preprocess(Number, z.number()),
        newName: z.string(),
      })
      .safeParse(fields)

    if (!currentUser.activeUserTeamId) {
      return fail(422, {
        error: `User needs an active team`,
      })
    }

    if (schema.success) {
      const newChat = await forkChat(
        schema.data.chatId,
        currentUser.id,
        currentUser.activeUserTeamId,
        schema.data.newName
      )
      throw redirect(303, `/app/chats/${newChat.id}`)
    }

    if (schema.error.errors.length) {
      return fail(422, {
        fields,
        errors: schema.error.flatten().fieldErrors,
      })
    }

    return fail(500, {
      fields,
      error: `${schema.error}`,
    })
  },
}
