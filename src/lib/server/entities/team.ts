import { prisma } from '$lib/server/prisma'
import { encrypt } from '$lib/server/utils/crypto'
import type { Prisma } from '@prisma/client'

export const updateTeam = async (
  id: number,
  name: string,
  openAiApiKey?: string,
  ollamaBaseUrl?: string
) => {
  if (!process.env.SECRET_KEY) {
    throw new Error('You must have SECRET_KEY set in your env.')
  }

  const apiKey = openAiApiKey ? encrypt(openAiApiKey, process.env.SECRET_KEY) : null

  return prisma.team.update({
    where: { id },
    data: {
      name,
      openAiApiKey: apiKey,
      ollamaBaseUrl: ollamaBaseUrl,
    },
  })
}

export const updateTeamModel = async (id: number, model: string) => {
  return prisma.team.update({
    where: { id },
    data: {
      teamModel: model,
    },
  })
}

export const getTeamByName = async (name: string) => {
  return prisma.team.findUnique({
    where: {
      name,
    },
  })
}

export type TeamWithMembers = Prisma.PromiseReturnType<typeof getTeamByIdWithMembers>

export const getTeamByIdWithMembers = async (id: number) =>
  prisma.team.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      teamUsers: {
        include: {
          user: true,
        },
      },
    },
  })

export const createTeam = async (name: string, openAiApiKey?: string, ollamaBaseUrl?: string) => {
  if (!process.env.SECRET_KEY) {
    throw new Error('You must have SECRET_KEY set in your env.')
  }

  const apiKey = openAiApiKey ? encrypt(openAiApiKey, process.env.SECRET_KEY) : null

  return prisma.team.create({
    data: {
      name,
      openAiApiKey: apiKey,
      ollamaBaseUrl: ollamaBaseUrl,
    },
  })
}
