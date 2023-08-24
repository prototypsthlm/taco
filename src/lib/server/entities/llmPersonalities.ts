import { prisma } from '../prisma'

export const getLlmPersonalitiesByUserId = (userId: number) => {
  return prisma.llmPersonality.findMany({
    where: { ownerId: userId },
  })
}
