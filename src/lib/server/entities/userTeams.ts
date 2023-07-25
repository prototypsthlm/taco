import { prisma } from '$lib/server/prisma'
import type { Role } from '@prisma/client'

export const updateRole = async (userId: number, teamId: number, role: Role) => {
  const userWithTeams = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      userTeams: {
        include: {
          team: true,
        },
      },
    },
  })

  const userTeam = userWithTeams.userTeams?.find((x) => x.teamId === teamId)

  if (!userTeam) {
    throw new Error('User is not in team.')
  }

  return prisma.userTeams.update({
    where: { id: userTeam?.id },
    data: {
      role,
    },
  })
}

export const removeUserFromTeam = async (userId: number, teamId: number) => {
  const userWithTeams = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      userTeams: {
        include: {
          team: true,
        },
      },
    },
  })

  const userTeam = userWithTeams.userTeams?.find((x) => x.teamId === teamId)

  if (!userTeam) {
    throw new Error('User is not in team.')
  }

  return prisma.userTeams.delete({
    where: { id: userTeam?.id },
  })
}
