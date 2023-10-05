import { shareChatWithUsers } from '$lib/server/entities/chat'
import type { RequestHandler } from '@sveltejs/kit'
import { json } from '@sveltejs/kit'
import { z, ZodError } from 'zod'

export const PATCH: RequestHandler = async ({ request, params }) => {
  const fields = Object.fromEntries(await request.formData())

  try {
    const schema = z
      .object({
        email: z.preprocess(String, z.string().email()),
      })
      .parse(fields)

    const success = await shareChatWithUsers(Number(params.chatId), [schema.email])
    if (!success) {
      return json({ fields, error: 'User not found' }, { status: 422 })
    }

    return json({ message: 'Chat shared successfully' })
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.flatten().fieldErrors
      return json({ errors }, { status: 422 })
    }

    return json({ error: `${error}` }, { status: 500 })
  }
}
