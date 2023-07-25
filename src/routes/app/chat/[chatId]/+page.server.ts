import { getChatWithRelationsById } from '$lib/server/entities/chat'
import { sendMessage } from '$lib/server/utils/chatting'
import { fail, type Actions } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, parent }) => {
  const { chats, user } = await parent()
  const chatId = Number(params.chatId)
  const chat = await getChatWithRelationsById(chatId)

  return {
    user,
    chats,
    chatId,
    chat,
  }
}

export const actions: Actions = {
  sendMessage: async ({ request, locals }) => {
    const data = Object.fromEntries(await request.formData())

    const res = await sendMessage(data, locals.currentUser)

    if (res.error) {
      return fail(res.error.httpStatusCode, {
        data: res.error.data,
        errors: res.error.error,
      })
    }

    return res
  },
}
