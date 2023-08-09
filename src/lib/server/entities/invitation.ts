import { prisma } from '$lib/server/prisma'

export const createInvitation = (hash: string, teamId: number) => {
  return prisma.invitation.create({
    data: {
      hash,
      teamId,
    },
  })
}

export const getInvitationsByTeamId = (teamId: number) => {
  return prisma.invitation.findMany({
    where: {
      teamId,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export const getInvitationById = (id: number) => {
  return prisma.invitation.findFirst({
    where: {
      id,
    },
  })
}

export const getInvitationByHash = (hash: string) => {
  return prisma.invitation.findFirst({
    where: {
      hash,
    },
    include: {
      team: { include: { teamUsers: true } },
    },
  })
}

export const deleteInvitationById = (id: number) => {
  return prisma.invitation.delete({
    where: {
      id,
    },
  })
}
