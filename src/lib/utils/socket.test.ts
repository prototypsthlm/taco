import {
  buildSocketUsers,
  getSocketUserForUser,
  refreshUsersFromChat,
  updateSocketUsers,
} from '$lib/utils/socket'
import { describe, expect, it } from 'vitest'

describe('buildSocketUsers function tests', () => {
  it('creates SocketUser array without the provided user', () => {
    const chat = {
      sharedWith: [{ user: { id: 1 } }, { user: { id: 2 } }],
      owner: { user: { id: 3 } },
    }
    const user = { id: 1 }

    const result = buildSocketUsers(user as any, chat as any)
    expect(result).toEqual([
      { id: 2, connected: false, typing: false },
      { id: 3, connected: false, typing: false },
    ])
  })

  it('handles empty shared users', () => {
    const chat = {
      sharedWith: [],
      owner: { user: { id: 3 } },
    }
    const user = { id: 3 }

    const result = buildSocketUsers(user as any, chat as any)
    expect(result).toEqual([])
  })
})

describe('updateSocketUsers function tests', () => {
  const socketUsers = [
    { id: 1, connected: false, typing: false },
    { id: 2, connected: true, typing: true },
    { id: 3, connected: false, typing: false },
  ]

  it('updates connected and typing status based on provided updatedSocketUsers', () => {
    const updatedSocketUsers = [
      { id: 1, connected: true, typing: false },
      { id: 3, connected: true, typing: false },
    ]

    const result = updateSocketUsers(socketUsers as any, updatedSocketUsers as any)
    expect(result).toEqual([
      { id: 1, connected: true, typing: false },
      { id: 2, connected: false, typing: false },
      { id: 3, connected: true, typing: false },
    ])
  })
})

describe('getSocketUserForUser function tests', () => {
  it('retrieves the matching SocketUser for a given User', () => {
    const socketUsers = [
      { id: 1, connected: false, typing: false },
      { id: 2, connected: true, typing: true },
      { id: 3, connected: false, typing: false },
    ]
    const user = { id: 2 }

    const result = getSocketUserForUser(user as any, socketUsers as any)
    expect(result).toEqual({ id: 2, connected: true, typing: true })
  })

  it('returns null if no matching SocketUser is found', () => {
    const socketUsers = [
      { id: 1, connected: false, typing: false },
      { id: 2, connected: true, typing: true },
      { id: 3, connected: false, typing: false },
    ]
    const user = { id: 4 }

    const result = getSocketUserForUser(user as any, socketUsers as any)
    expect(result).toBeNull()
  })
})

describe('refreshUsersFromChat function tests', () => {
  it('refreshes the socket users based on the chat and the current socket users', () => {
    const chat = {
      sharedWith: [{ user: { id: 1 } }, { user: { id: 2 } }],
      owner: { user: { id: 3 } },
    }
    const currentUser = { id: 1 }
    const socketUsers = [
      { id: 1, connected: true, typing: true },
      { id: 2, connected: true, typing: false },
      { id: 3, connected: false, typing: false },
    ]

    const result = refreshUsersFromChat(currentUser as any, chat as any, socketUsers as any)
    expect(result).toEqual([
      { id: 2, connected: true, typing: false },
      { id: 3, connected: false, typing: false },
    ])
  })
})
