import { describe, it, expect } from 'vitest'
import { buildSocketUsers, updateSocketUsers } from '$lib/utils/socket' // replace with your actual module name

describe('buildSocketUsers function tests', () => {
  it('creates SocketUser array without the provided user', () => {
    const chat = {
      sharedWith: [{ user: { id: 1 } }, { user: { id: 2 } }],
      owner: { user: { id: 3 } },
    }
    const user = { id: 1 }

    const result = buildSocketUsers(chat as any, user as any)
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

    const result = buildSocketUsers(chat as any, user as any)
    expect(result).toEqual([])
  })
})

describe('updateSocketUsers function tests', () => {
  const socketUsers = [
    { id: 1, connected: false, typing: false },
    { id: 2, connected: true, typing: true },
    { id: 3, connected: false, typing: false },
  ]

  it('updates connected and typing status based on provided IDs', () => {
    const result = updateSocketUsers(socketUsers as any, {
      connectedUserIds: [1, 3],
      typingUserIds: [2],
    })
    expect(result).toEqual([
      { id: 1, connected: true, typing: false },
      { id: 2, connected: false, typing: true },
      { id: 3, connected: true, typing: false },
    ])
  })

  it('retains original status if IDs are not provided', () => {
    const result = updateSocketUsers(socketUsers as any)
    expect(result).toEqual(socketUsers)
  })
})
