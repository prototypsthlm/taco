import { prisma } from '../prisma'

export const getLlmPersonalitiesByUserId = (userId: number) => {
  return prisma.llmPersonality.findMany({
    where: { ownerId: userId },
  })
}

export const createLlmPersonality = (ownerId: number, name: string, context: string) => {
  return prisma.llmPersonality.create({
    data: {
      name,
      context,
      ownerId,
    },
  })
}
