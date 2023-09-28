import type { ChatWithRelations } from '$lib/server/entities/chat'
import type { BaseSocketUser, SocketUser } from '$lib/stores/socket'
import { filterUndefinedOrNull, unique } from '$lib/utils/array'
import type { User } from '@prisma/client'

/**
 * Constructs an array of SocketUser objects for the provided chat.
 *
 * @param chat - The chat object with relations.
 * @param user - The user for whom the SocketUser array is being created.
 * @returns An array of SocketUser objects.
 */
export const buildSocketUsers = (user: User, chat?: ChatWithRelations): SocketUser[] => {
  const sharedUsers = chat?.sharedWith.map((x) => x.user) || []
  const allUsers = [...sharedUsers, chat?.owner.user]
  const uniqueUsers = filterUndefinedOrNull(unique(allUsers))
  const filteredUsers = uniqueUsers.filter((u) => u.id !== user.id)

  return filteredUsers.map((u) => ({ ...u, connected: false, typing: false }))
}

/**
 * Updates the connection and typing status for an array of SocketUser objects.
 *
 * @param socketUsers - The current array of SocketUser objects.
 * @param updatedSocketUsers An array of updated socket users
 * @returns An updated array of SocketUser objects.
 */
export const updateSocketUsers = (
  socketUsers: SocketUser[],
  updatedSocketUsers: BaseSocketUser[]
): SocketUser[] => {
  return socketUsers.map((user) => {
    const matchingUser = updatedSocketUsers.find((uu) => uu.id === user.id)

    const isConnected = !!(matchingUser && matchingUser.connected)
    const isTyping = !!(matchingUser && matchingUser.typing)

    return {
      ...user,
      connected: isConnected,
      typing: isTyping,
    }
  })
}
