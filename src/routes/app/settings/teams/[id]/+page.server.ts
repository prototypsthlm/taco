import {
  createInvitation,
  deleteInvitationById,
  getInvitationById,
  getInvitationsByTeamId,
} from '$lib/server/entities/invitation'
import { countTeamChats, updateTeam } from '$lib/server/entities/team'
import { getUserWithTeamsAndTeamUsersById } from '$lib/server/entities/user'
import { getUserTeamById, removeUserTeam, updateUserTeamRole } from '$lib/server/entities/userTeams'
import { decrypt } from '$lib/server/utils/crypto'
import { isUserAdmin, isUserInTeam } from '$lib/server/utils/database'
import { Role } from '@prisma/client'
import { error, fail } from '@sveltejs/kit'
import { randomUUID } from 'crypto'
import { z, ZodError } from 'zod'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals: { currentUser } }) => {
  const user = await getUserWithTeamsAndTeamUsersById(currentUser.id)
  const teamId = Number(params.id)
  const invitations = getInvitationsByTeamId(teamId)

  const userTeam = user.userTeams.find((x) => x.teamId === teamId)

  if (!userTeam) throw error(404, "Doesn't belong to this team or the team doesn't exist")

  if (userTeam.team?.openAiApiKey) {
    if (userTeam?.role === Role.MEMBER) {
      userTeam.team.openAiApiKey = '*'.repeat(64)
    } else {
      if (!process.env.SECRET_KEY) {
        throw new Error('You must have SECRET_KEY set in your env.')
      }

      userTeam.team.openAiApiKey = decrypt(userTeam.team.openAiApiKey, process.env.SECRET_KEY)
    }
  }

  return {
    userTeam,
    chatCount: await countTeamChats(userTeam.teamId),
    invitations,
  }
}

export const actions: Actions = {
  updateTeamDetails: async ({ request, params, locals }) => {
    const fields = Object.fromEntries(await request.formData())
    try {
      const schema = z
        .object({
          openAiApiKey: z.string().min(1),
          name: z.string().min(1),
        })
        .parse(fields)

      if (!(await isUserAdmin(Number(params.id), locals.currentUser.id))) {
        return fail(422, {
          keySection: {
            fields,
            error: 'User must be admin of the given team',
          },
        })
      }

      await updateTeam(Number(params.id), schema.name, schema.openAiApiKey)

      return {
        keySection: {
          success: 'Team updated successfully.',
        },
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.flatten().fieldErrors

        return fail(422, {
          keySection: {
            fields,
            errors,
          },
        })
      }

      return fail(500, {
        keySection: {
          fields,
          error: `${error}`,
        },
      })
    }
  },

  updateUser: async ({ request, params, locals }) => {
    const teamId = Number(params.id)
    const requestingUserId = locals.currentUser.id
    if (!(await isUserAdmin(teamId, requestingUserId))) {
      return fail(401, {
        userSection: {
          error: 'You are no admin of this team.',
        },
      })
    }

    const fields = Object.fromEntries(await request.formData())
    const userId = Number(fields.userId)
    if (userId === requestingUserId) {
      return fail(400, {
        userSection: {
          error: 'You cannot change your own role.',
        },
      })
    }

    const userTeamId = Number(fields.userTeamId)
    const userTeam = await getUserTeamById(userTeamId)
    if (userTeam?.role === Role.OWNER) {
      return fail(400, {
        userSection: {
          error: 'You cannot change the role of the owner.',
        },
      })
    }

    const userEmail = fields.userEmail
    if (!(await isUserInTeam(teamId, userId))) {
      return fail(401, {
        userSection: {
          error: `User: ${userEmail} is not in the team`,
        },
      })
    }

    const buttonAction = fields.submit
    if (buttonAction === 'remove') {
      await removeUserTeam(userTeamId)
      return {
        userSection: {
          success: `User ${userEmail} successfully removed from the team.`,
        },
      }
    } else if (buttonAction === 'downgrade') {
      await updateUserTeamRole(userTeamId, Role.MEMBER)
      return {
        userSection: {
          success: `User ${userEmail} successfully downgraded to ${Role.MEMBER}.`,
        },
      }
    } else if (buttonAction === 'upgrade') {
      await updateUserTeamRole(userTeamId, Role.ADMIN)
      return {
        userSection: {
          success: `User ${userEmail} successfully upgraded to ${Role.ADMIN}.`,
        },
      }
    }

    return fail(422, {
      userSection: {
        error: 'No action selected.',
      },
    })
  },
  createInvitation: async ({ params, locals }) => {
    const teamId = Number(params.id)
    const requestingUserId = locals.currentUser.id

    if (!(await isUserAdmin(teamId, requestingUserId))) {
      return fail(401, {
        userSection: {
          error: 'You are no admin of this team.',
        },
      })
    }

    const uuid = randomUUID()
    await createInvitation(uuid, teamId)

    return {
      invitationSection: {
        success: `Created a inviation with uuid ${uuid}.`,
      },
    }
  },
  deleteInvitation: async ({ request, params, locals }) => {
    const teamId = Number(params.id)
    const requestingUserId = locals.currentUser.id

    if (!(await isUserAdmin(teamId, requestingUserId))) {
      return fail(401, {
        userSection: {
          error: 'You are no admin of this team.',
        },
      })
    }

    const fields = Object.fromEntries(await request.formData())
    const invitationId = Number(fields.invitationId)

    const invitation = await getInvitationById(invitationId)
    if (!invitation) {
      return fail(401, {
        invitationSection: {
          error: `Invitation with id ${invitationId} does not exist`,
        },
      })
    } else if (invitation.teamId !== teamId) {
      return fail(401, {
        invitationSection: {
          error: 'Invitation does not belong to this team.',
        },
      })
    }

    await deleteInvitationById(invitationId)

    return {
      invitationSection: {
        success: `Invitation with id ${invitationId} successfully deleted.`,
      },
    }
  },
}
