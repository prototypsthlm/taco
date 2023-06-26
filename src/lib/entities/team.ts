import { prisma } from '$lib/prisma'

export const updateTeam = async (id: number, name: string, openAiApiKey: string) => {
  return prisma.team.update({
    where: { id },
    data: {
      name,
      openAiApiKey,
    },
  })
}
