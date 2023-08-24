import { getLlmPersonalitiesByUserId } from '$lib/server/entities/llmPersonalities'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { currentUser } }) => {
  const llmPersonalities = await getLlmPersonalitiesByUserId(currentUser.id)

  return {
    personalities: llmPersonalities,
  }
}

export const actions: Actions = {
  addPersonality: async ({ request, locals }) => {
    return { success: true }
  },
}
