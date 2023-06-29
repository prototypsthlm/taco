import type { PageServerLoad } from './$types'

export const load: PageServerLoad = ({ locals }) => {
  if (locals.currentUser) return { isLoggedIn: true }
  else return { isLoggedIn: false }
}
