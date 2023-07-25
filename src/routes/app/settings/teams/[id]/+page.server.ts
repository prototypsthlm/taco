import { countTeamChats, updateTeam } from '$lib/server/entities/team'
import { Role } from '@prisma/client'
import type { Actions, PageServerLoad } from './$types'
import { z, ZodError } from 'zod'
import { fail } from '@sveltejs/kit'

import { getTeamWithMembers } from '$lib/server/entities/team'
import { isUserAdmin, isUserInTeam } from '$lib/server/utils/database'
import { removeUserFromTeam, updateRole } from '$lib/server/entities/userTeams'

export type TeamMember = {
  id: number
  name: string
  email: string
  role: Role
  addedAt: Date
}

export const load: PageServerLoad = async ({ params, parent, locals }) => {
  const { user } = await parent()

  const teamId = Number(params.id)
  const team = await getTeamWithMembers(teamId)
  const userId = locals.currentUser.id

  const members = team?.userTeams.map((userTeam) => {
    return {
      id: userTeam?.user?.id,
      name: userTeam?.user?.name,
      email: userTeam?.user?.email,
      role: userTeam?.role,
      addedAt: userTeam?.createdAt,
    } as TeamMember
  })

  return {
    members,
    userId,
    isAdmin: isUserAdmin(teamId, userId),
    chatCount: await countTeamChats(teamId),
    userTeam: user?.userTeams.find((x) => x.teamId?.toString() === params.id),
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

      if (!isUserAdmin(Number(params.id), locals.currentUser.id)) {
        return fail(422, {
          teamSection: {
            fields,
            error: 'User must be admin of the given team',
          },
        })
      }

      await updateTeam(Number(params.id), schema.name, schema.openAiApiKey)

      return {
        teamSection: {
          success: 'Team updated successfully.',
        },
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.flatten().fieldErrors

        return fail(422, {
          teamSection: {
            fields,
            errors,
          },
        })
      }

      return fail(500, {
        teamSection: {
          fields,
          error: `${error}`,
        },
      })
    }
  },

  updateUser: async ({ request, params, locals }) => {
    const teamId = Number(params.id)
    const requestingUserId = locals.currentUser.id

    if (!isUserAdmin(teamId, requestingUserId)) {
      return fail(401, {
        userSection: {
          error: 'You are no admin of this team.',
        },
      })
    }

    const fields = Object.fromEntries(await request.formData())
    const buttonAction = fields.submit
    const userId = Number(fields.userId)
    const userEmail = fields.userEmail

    if (userId === requestingUserId) {
      return fail(400, {
        userSection: {
          error: 'You cannot change your own role.',
        },
      })
    }

    if (!isUserInTeam(teamId, userId)) {
      return fail(401, {
        userSection: {
          error: `User: ${userEmail} is not in the team`,
        },
      })
    }

    if (buttonAction == 'remove') {
      removeUserFromTeam(userId, teamId)
      return {
        userSection: {
          success: `User ${userEmail} successfully removed from the team.`,
        },
      }
    } else if (buttonAction == 'downgrade') {
      updateRole(userId, teamId, Role.MEMBER)
      return {
        userSection: {
          success: `User ${userEmail} successfully downgraded to ${Role.MEMBER}.`,
        },
      }
    } else if (buttonAction == 'upgrade') {
      updateRole(userId, teamId, Role.ADMIN)
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
}
