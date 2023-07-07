import { countTeamChats, updateTeam } from '$lib/server/entities/team'
import { getUserWithRelationsById } from '$lib/server/entities/user'
import { Role } from '@prisma/client'
import type { Actions, PageServerLoad } from './$types'
import { z, ZodError } from 'zod'
import { fail } from '@sveltejs/kit'

import { getTeamWithMembers } from '$lib/server/entities/team'

export type TeamMember = {
  id: number
  name: string
  email: string
  role: Role
  addedAt: Date
}

export const load: PageServerLoad = async ({ params, parent }) => {
  const { user } = await parent()

  const team = await getTeamWithMembers(Number(params.id))

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
    chatCount: await countTeamChats(Number(params.id)),
    userTeam: user?.userTeams.find((x) => x.teamId?.toString() === params.id),
  }
}

export const actions: Actions = {
  default: async ({ request, params, locals }) => {
    const fields = Object.fromEntries(await request.formData())
    try {
      const schema = z
        .object({
          openAiApiKey: z.string().min(1),
          name: z.string().min(1),
        })
        .parse(fields)

      const user = await getUserWithRelationsById(locals.currentUser.id)

      if (
        !user?.userTeams.some((x) => x.teamId?.toString() === params.id && x.role === Role.ADMIN)
      ) {
        return fail(422, {
          fields,
          error: 'User must be admin of the given team',
        })
      }

      await updateTeam(parseInt(params.id, 10), schema.name, schema.openAiApiKey)

      return {
        success: 'Team updated successfully.',
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.flatten().fieldErrors

        return fail(422, {
          fields,
          errors,
        })
      }

      return fail(500, {
        fields,
        error,
      })
    }
  },
}
