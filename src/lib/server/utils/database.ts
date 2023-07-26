import { Role } from '@prisma/client'
import { getUserWithRelationsById } from '../entities/user'

export const isUserAdmin = async (teamId: number, userId: number) => {
  const user = await getUserWithRelationsById(userId)
  return user?.userTeams.some((x) => x.teamId === teamId && x.role === Role.ADMIN) || false
}

export const isUserInTeam = async (teamId: number, userId: number) => {
  const user = await getUserWithRelationsById(userId)
  return user?.userTeams.some((x) => x.teamId === teamId)
}
