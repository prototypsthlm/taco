import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ cookies }) => {
  cookies.delete('session_id', { path: '/' })
  throw redirect(303, '/signin')
}
