import { prisma } from '$lib/server/prisma'
import { encrypt } from '$lib/server/utils/crypto'

export const updateTeam = async (id: number, name: string, openAiApiKey: string) => {
  if (!process.env.SECRET_KEY) {
    throw new Error('You must have SECRET_KEY set in your env.')
  }

  return prisma.team.update({
    where: { id },
    data: {
      name,
      openAiApiKey: encrypt(openAiApiKey, process.env.SECRET_KEY),
    },
  })
}
