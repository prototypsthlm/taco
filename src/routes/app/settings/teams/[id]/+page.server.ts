import { countTeamChats, updateTeam } from '$lib/server/entities/team'
import { Role } from '@prisma/client'
import type { Actions, PageServerLoad } from './$types'
import { z, ZodError } from 'zod'
import { error, fail } from '@sveltejs/kit'

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
  if (!user) throw error(404, 'User not found')

  const teamId = Number(params.id)
  const team = await getTeamWithMembers(teamId)
  if (!team) throw error(404, 'Team not found')

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

  if (!members?.some((member) => member.id === userId))
    throw error(404, 'You are not a member of this team.')

  const isAdmin = await isUserAdmin(teamId, userId)
  if (!isAdmin) team.openAiApiKey = '*'.repeat(64)

  return {
    members,
    userId,
    isAdmin,
    chatCount: await countTeamChats(teamId),
    team,
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
