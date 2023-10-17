import { doesNotificationBelongToUser, markAsRead } from '$lib/server/entities/notification'
import { json } from '@sveltejs/kit'
import { z, ZodError } from 'zod'
import type { RequestHandler } from './$types'

export const PATCH: RequestHandler = async ({ params, locals }) => {
  try {
    const schema = z
      .object({
        id: z.preprocess(Number, z.number()),
      })
      .parse(params)

    const belong = await doesNotificationBelongToUser(schema.id, locals.currentUser.id)

    if (!belong) {
      return json({ error: 'Notification does not belong to user' }, { status: 422 })
    }

    await markAsRead(schema.id)

    console.log('markAsRead', schema.id)

    return json({
      message: 'Notification marked as read',
    })
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.flatten().fieldErrors
      return json({ errors }, { status: 422 })
    }

    return json({ error: `${error}` }, { status: 500 })
  }
}
