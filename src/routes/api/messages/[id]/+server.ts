import { deleteMessage } from '$lib/server/entities/message'
import { error, json } from '@sveltejs/kit'
import { z } from 'zod'
import type { RequestHandler } from './$types'

export const DELETE: RequestHandler = async ({ params }) => {
  const schema = z
    .object({
      id: z.preprocess(Number, z.number()),
    })
    .safeParse(params)

  if (!schema.success) {
    throw error(422, json({ errors: schema.error.flatten().fieldErrors }))
  }

  try {
    await deleteMessage(schema.data.id)
  } catch (e) {
    throw error(500, json({ error: `${e}` }))
  }

  return json({ success: true })
}
