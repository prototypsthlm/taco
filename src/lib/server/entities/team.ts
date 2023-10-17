import {
  calcChatTokenCosts,
  fillMissingChatTokenCount,
  getAllTeamChats,
} from '$lib/server/entities/chat'
import { prisma } from '$lib/server/prisma'
import { encrypt } from '$lib/server/utils/crypto'
import { asyncMap, asyncReduce } from '$lib/utils/array'
import type { Prisma } from '@prisma/client'

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

export const calcTeamTokenCosts = async (teamId: number) => {
  const teamChats = await prisma.chat.findMany({
    where: {
      owner: {
        teamId: teamId,
      },
      roleContentTokenCount: null,
      messages: {
        every: {
          questionTokenCount: null,
          answerTokenCount: null,
        },
      },
    },
    include: {
      messages: true,
    },
  })

  await asyncMap(teamChats, fillMissingChatTokenCount)

  const refreshedTeamChats = await getAllTeamChats(teamId)

  const cost = await asyncReduce(
    refreshedTeamChats,
    async (memo, chat) => {
      const chatCost = await calcChatTokenCosts(chat)
      return { input: memo.input + chatCost.input, output: memo.output + chatCost.output }
    },
    { input: 0, output: 0 }
  )

  return cost.input + cost.output
}
