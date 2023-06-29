import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = () => {
  throw redirect(303, 'settings/account')
}
