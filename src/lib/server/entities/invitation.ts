import { prisma } from '$lib/server/prisma'

export const createInvitation = (uuid: string, teamId: number) => {
  return prisma.invitation.create({
    data: {
      hash: uuid,
      teamId,
    },
  })
}

export const getInvitationsByTeamId = (teamId: number) => {
  return prisma.invitation.findMany({
    where: {
      teamId,
    },
  })
}
