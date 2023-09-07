import {
  deleteChat,
  forkChat,
  getChatWithRelationsById,
  shareChatWithUsers,
} from '$lib/server/entities/chat'
import { isUserOwningChat } from '$lib/server/utils/database'
import { fail, redirect, type Actions } from '@sveltejs/kit'
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
  deleteChat: async ({ locals: { currentUser }, request }) => {
    const data = Object.fromEntries(await request.formData())
    const chatId = Number(data.chatId)

    if (!(await isUserOwningChat(chatId, currentUser.id))) {
      return fail(401, { message: `You don't own the chat ${chatId}` })
    }

    await deleteChat(chatId)

    throw redirect(303, '/app')
  },
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
      throw redirect(303, `/app/chat/${newChat.id}`)
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
  shareChat: async ({ locals: { currentUser }, request }) => {
    const fields = Object.fromEntries(await request.formData())

    // Preprocess the comma-separated string of emails into an array
    const preprocessEmails = (str: unknown) =>
      String(str)
        .split(',')
        .map((email) => email.trim())

    const schema = z
      .object({
        chatId: z.preprocess(Number, z.number()),
        emails: z.preprocess(
          String,
          z.preprocess(preprocessEmails, z.array(z.string().email()).min(1))
        ),
      })
      .safeParse(fields)

    if (!currentUser.activeUserTeamId) {
      return fail(422, {
        error: `User needs an active team`,
      })
    }

    if (schema.success) {
      // Perform the sharing logic here
      const shared = await shareChatWithUsers(schema.data.chatId, schema.data.emails)

      if (shared) {
        return { status: 200, body: { message: 'Chat shared successfully' } }
      } else {
        return fail(500, {
          fields,
          error: 'Failed to share chat',
        })
      }
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
