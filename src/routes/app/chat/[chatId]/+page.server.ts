import { getChatWithRelationsById } from '$lib/entities/chat'
import { sendMessage } from '$lib/utils/chatting'
import { fail, type Actions } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const chatId = Number(params.chatId)
  const chat = await getChatWithRelationsById(chatId)

  return {
    chatId,
    chat: {
      ...chat,
      temperature: String(chat?.temperature),
    },
  }
}

export const actions: Actions = {
  sendMessage: async ({ request, locals }) => {
    const data = Object.fromEntries(await request.formData())
    const userId = locals.currentUser.id

    const res = await sendMessage(data, userId)

    if (res.error) {
      return fail(res.error.httpStatusCode, {
        data: res.error.data,
        errors: res.error.error,
      })
    } else {
      return {
        chat: res.data,
      }
    }
  },
}
