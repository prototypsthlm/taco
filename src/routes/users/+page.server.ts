import { prisma } from '$lib/prisma'
import type { PageServerLoad } from './$types'

export const load = (async () => {
  const users = await prisma.user.findMany()

  return { users }
}) satisfies PageServerLoad

