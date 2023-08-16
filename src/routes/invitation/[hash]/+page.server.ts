import {
  deleteInvitationById,
  getInvitationByHash,
  getInvitationById,
} from '$lib/server/entities/invitation'
import { changeActiveUserTeam } from '$lib/server/entities/user'
import { createUserTeam } from '$lib/server/entities/userTeams'
import { error, fail, redirect, type Actions } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals }) => {
  const currentUser = locals.currentUser

  if (!currentUser) {
    return {
      error: {
        header: 'Login is required',
        description:
          'You need to login or create an account before you can accept this invitation.',
        showLoginButton: true,
      },
    }
  }

  const invitation = await getInvitationByHash(params.hash)

  if (!invitation) {
    throw error(404, { message: 'Invitation not found' })
  }

  if (invitation.team.teamUsers.some((x) => x.userId === currentUser.id)) {
    return {
      error: {
        header: 'You are already a member of this team',
        description: 'You cannot join a team that you are already member of.',
      },
    }
  }

  invitation.team.openAiApiKey = '*'.repeat(64)

  return {
    userName: currentUser.name,
    invitation,
  }
}

export const actions: Actions = {
  acceptInvitation: async ({ request, locals }) => {
    const fields = Object.fromEntries(await request.formData())
    const invitationId = Number(fields.invitationId)
    const invitation = await getInvitationById(invitationId)
    const currentUser = locals.currentUser

    if (!invitation) {
      return fail(404, { message: 'Invitation not found' })
    }

    const userTeam = await createUserTeam(currentUser.id, invitation.teamId)
    await deleteInvitationById(invitationId)
    await changeActiveUserTeam(currentUser.id, userTeam.id)

    throw redirect(303, `/app`)
  },
}
