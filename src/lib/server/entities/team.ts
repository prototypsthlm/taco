import { prisma } from '$lib/server/prisma'

export const updateTeam = async (id: number, name: string, openAiApiKey: string) => {
  return prisma.team.update({
    where: { id },
    data: {
      name,
      openAiApiKey,
    },
  })
}
