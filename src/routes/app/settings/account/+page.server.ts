import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = ({ locals }) => {
  return {
    user: locals.currentUser,
  }
}
