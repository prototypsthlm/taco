import { sendMessage } from '$lib/server/utils/chatting'
import { fail } from '@sveltejs/kit'
import type { Actions } from './$types'

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
