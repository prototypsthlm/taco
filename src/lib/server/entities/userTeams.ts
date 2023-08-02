import { prisma } from '$lib/server/prisma'
import type { Role } from '@prisma/client'

export const updateUserTeamRole = async (id: number, role: Role) =>
  prisma.userTeam.update({
    where: { id },
    data: {
      role,
    },
  })

export const removeUserTeam = async (id: number) =>
  prisma.userTeam.delete({
    where: { id },
  })
