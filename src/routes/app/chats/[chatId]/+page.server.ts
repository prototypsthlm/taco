import { forkChat, getChatWithRelationsById } from '$lib/server/entities/chat'
import { type Actions, fail, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import type { PageServerLoad } from './$types'
import { getAvailableModels } from '$lib/server/api/openai'

export const load: PageServerLoad = async ({ params, locals: { currentUser } }) => {
  const chatId = Number(params.chatId)


  if (!currentUser.activeUserTeam?.team) {
    throw redirect(303, '/app/settings/teams')
  }

  try {
    return {
      chat: getChatWithRelationsById(chatId),
      models: getAvailableModels(currentUser.activeUserTeam?.team),
    }
  } catch (error) {
    throw redirect(303, '/app')
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
function getModels(): any {
  throw new Error('Function not implemented.')
}

