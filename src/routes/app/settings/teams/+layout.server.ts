import { getUserWithRelationsById } from '$lib/server/entities/user'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
  const userWithRelations = await getUserWithRelationsById(locals.currentUser.id)
  return {
    user: userWithRelations,
  }
}
