import { getUserWithRelationsById } from '$lib/server/entities/user'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const userWithRelations = await getUserWithRelationsById(locals.currentUser.id)
  return {
    user: userWithRelations,
  }
}
