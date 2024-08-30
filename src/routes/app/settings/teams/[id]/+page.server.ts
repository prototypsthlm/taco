import { countTeamChats } from '$lib/server/entities/chat'
import {
  createInvitation,
  deleteInvitationById,
  getInvitationById,
  getInvitationsByTeamId,
} from '$lib/server/entities/invitation'
import {
  getTeamByIdWithMembers,
  getTeamByName,
  updateTeam,
  updateTeamModel,
} from '$lib/server/entities/team'
import { getUserWithUserTeamsById, isUserAdmin, isUserInTeam } from '$lib/server/entities/user'
import { getUserTeamById, removeUserTeam, updateUserTeamRole } from '$lib/server/entities/userTeams'
import { decrypt } from '$lib/server/utils/crypto'
import { Role } from '@prisma/client'
import { error, fail } from '@sveltejs/kit'
import { randomUUID } from 'crypto'
import { z, ZodError } from 'zod'
import type { Actions, PageServerLoad } from './$types'
import { getAvailableModels } from '$lib/server/api/openai'

export const load: PageServerLoad = async ({ params, locals: { currentUser } }) => {
  const user = await getUserWithUserTeamsById(currentUser.id)
  const teamId = Number(params.id)
  const invitations = getInvitationsByTeamId(teamId)

  const userTeam = user.userTeams.find((x) => x.teamId === teamId)

  if (!userTeam) throw error(404, "Doesn't belong to this team or the team doesn't exist")

  const team = await getTeamByIdWithMembers(teamId)
  const availableModels = await getAvailableModels(team)

  if (team?.openAiApiKey) {
    if (userTeam?.role === Role.MEMBER) {
      team.openAiApiKey = '*'.repeat(64)
    } else {
      if (!process.env.SECRET_KEY) {
        throw new Error('You must have SECRET_KEY set in your env.')
      }

      team.openAiApiKey = decrypt(team.openAiApiKey, process.env.SECRET_KEY)
    }
  }

  return {
    userTeam,
    team,
    chatCount: countTeamChats(userTeam.teamId),
    invitations,
    availableModels,
  }
}

export const actions: Actions = {
  updateTeamDetails: async ({ request, params, locals }) => {
    const fields = Object.fromEntries(await request.formData())
    console.log(fields)
    const teamId = Number(params.id)
    try {
      const schema = z
        .object({
          name: z.string().min(1),
          openAiApiKey: z.string().optional(),
          ollamaBaseUrl: z
            .string()
            .refine((val) => val === '' || z.string().url().safeParse(val).success, {
              message: 'Invalid URL format',
            }),
        })
        .superRefine(({ openAiApiKey, ollamaBaseUrl }, refinementContext) => {
          if (!openAiApiKey && !ollamaBaseUrl) {
            refinementContext.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Please provide an API Key or Ollama URL',
              fatal: true,
            })
          }
        })
        .parse(fields)

      if (!(await isUserAdmin(teamId, locals.currentUser.id))) {
        return fail(422, {
          keySection: {
            fields,
            error: 'User must be admin of the given team',
          },
        })
      }

      const team = await getTeamByName(schema.name)
      if (team && team.id !== teamId) {
        return fail(409, {
          keySection: {
            fields,
            error: 'Team name already exists.',
          },
        })
      }

      await updateTeam(teamId, schema.name, schema.openAiApiKey, schema.ollamaBaseUrl)

      return {
        keySection: {
          success: 'Team updated successfully.',
        },
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.flatten()

        return fail(422, {
          keySection: {
            fields,
            errors: errors.fieldErrors,
            formErrors: errors.formErrors,
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
        invitationSection: {
          error: 'You are no admin of this team.',
        },
      })
    }

    const uuid = randomUUID()
    await createInvitation(uuid, teamId)

    return {
      invitationSection: {
        success: `Created a invitation with hash ${uuid}.`,
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
  updateTeamModel: async ({ request, params, locals }) => {
    const teamId = Number(params.id)
    const fields = Object.fromEntries(await request.formData())
    const model = fields.model.toString()

    const requestingUserId = locals.currentUser.id
    if (!(await isUserAdmin(teamId, requestingUserId))) {
      return fail(401, {
        modelSection: {
          error: 'You are no admin of this team.',
        },
      })
    }

    await updateTeamModel(teamId, model)

    return {
      modelSection: {
        success: 'Model updated successfully.',
      },
    }
  },
}
