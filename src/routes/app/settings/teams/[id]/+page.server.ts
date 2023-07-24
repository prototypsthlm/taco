import { countTeamChats, updateTeam } from '$lib/server/entities/team'
import { getUserWithRelationsById } from '$lib/server/entities/user'
import { Role } from '@prisma/client'
import type { Actions, PageServerLoad } from './$types'
import { z, ZodError } from 'zod'
import { fail } from '@sveltejs/kit'

import { getTeamWithMembers } from '$lib/server/entities/team'
import { isUserAdmin } from '$lib/server/utils/database'

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
    isAdmin: isUserAdmin(teamId, locals.currentUser.id),
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
    const currentUserId = locals.currentUser.id

    if (!isUserAdmin(teamId, currentUserId)) {
      return fail(401, {
        userSection: {
          error: 'You are no admin of this team.',
        },
      })
    }

    const fields = Object.fromEntries(await request.formData())

    if (fields.remove) {
      // remove user from team
    } else if (fields.downgrade) {
      // downgrade user to member
    } else if (fields.upgrade) {
      // upgrade user to admin
    }

    return {
      userSection: {
        success: 'User removed successfully.',
      },
    }
  },
}
