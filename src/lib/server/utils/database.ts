import { Role, type User } from '@prisma/client'
import { getUserWithChatsById, getUserWithRelationsById } from '$lib/server/entities/user'

export const isUserAdmin = async (teamId: number, userId: number) => {
  const user = await getUserWithRelationsById(userId)
  return (
    user?.userTeams.some(
      (x) => x.teamId === teamId && (x.role === Role.ADMIN || x.role === Role.OWNER)
    ) || false
  )
}

export const isUserInTeam = async (teamId: number, userId: number) => {
  const user = await getUserWithRelationsById(userId)
  return user?.userTeams.some((x) => x.teamId === teamId)
}

export const isUserOwningChat = async (chatId: number, userId: number) => {
  const user = await getUserWithChatsById(userId)
  return user?.activeUserTeam?.chats?.some((x) => x.id === chatId)
}

export const escapeUserSecrets = (user: User) => {
  user.password = null
  user.sessionId = null
}
