import type { ChatWithRelations } from '$lib/server/entities/chat'
import type { SocketUser } from '$lib/stores/socket'
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
 * @param connectedUserIds - An array of user IDs representing users who are currently connected.
 * @param typingUserIds - An array of user IDs representing users who are currently typing.
 * @returns An updated array of SocketUser objects.
 */
export const updateSocketUsers = (
  socketUsers: SocketUser[],
  {
    connectedUserIds = [],
    typingUserIds = [],
  }: { connectedUserIds?: number[]; typingUserIds?: number[] } = {}
): SocketUser[] => {
  return socketUsers.map((user) => {
    const isConnected = connectedUserIds ? connectedUserIds.includes(user.id) : user.connected
    const isTyping = typingUserIds ? typingUserIds.includes(user.id) : user.typing

    return {
      ...user,
      connected: isConnected,
      typing: isTyping,
    }
  })
}
