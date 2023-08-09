import { prisma } from '$lib/server/prisma'
import { encrypt } from '$lib/server/utils/crypto'

export const updateTeam = async (id: number, name: string, openAiApiKey: string | null) => {
  if (!process.env.SECRET_KEY) {
    throw new Error('You must have SECRET_KEY set in your env.')
  }

  const apiKey = openAiApiKey ? encrypt(openAiApiKey, process.env.SECRET_KEY) : null

  return prisma.team.update({
    where: { id },
    data: {
      name,
      openAiApiKey: apiKey,
    },
  })
}

export const countTeamChats = async (id: number) => {
  return prisma.chat.count({
    where: {
      owner: {
        teamId: id,
      },
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

export const createTeam = async (name: string, openAiApiKey: string | null) => {
  if (!process.env.SECRET_KEY) {
    throw new Error('You must have SECRET_KEY set in your env.')
  }

  const apiKey = openAiApiKey ? encrypt(openAiApiKey, process.env.SECRET_KEY) : null

  return prisma.team.create({
    data: {
      name,
      openAiApiKey: apiKey,
    },
  })
}
