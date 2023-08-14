import { prisma } from '$lib/server/prisma'
import { Role } from '@prisma/client'

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

export const getUserTeamById = async (id: number) =>
  prisma.userTeam.findUnique({
    where: { id },
  })

export const createUserTeam = async (userId: number, teamId: number, role: Role = Role.MEMBER) =>
  prisma.userTeam.create({
    data: {
      userId,
      teamId,
      role,
    },
  })
