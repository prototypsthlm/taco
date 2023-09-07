import { prisma } from '$lib/server/prisma'
import { generateSessionId } from '$lib/server/utils/crypto'
import bcrypt from 'bcryptjs'
import { escapeUserSecrets } from '../utils/database'

export const getUserWithRelationsById = async (id: number) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
    include: {
      userTeams: {
        include: {
          team: true,
        },
      },
    },
  })
  escapeUserSecrets(user)
  return user
}

export type UserBySessionId = Awaited<ReturnType<typeof getUserBySessionId>>

export const getUserBySessionId = (sessionId: string) =>
  prisma.user.findFirstOrThrow({
    where: {
      userSessions: {
        some: {
          sessionId: sessionId,
        },
      },
    },
    include: {
      activeUserTeam: true,
    },
  })

export const getUserIfCredentialsMatch = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user?.password) {
    return null
  }

  const isPasswordMatching = await bcrypt.compare(password, user.password)

  if (!isPasswordMatching) {
    return null
  }

  escapeUserSecrets(user)
  return user
}

export const createUser = async (name: string, email: string, password: string) => {
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: await bcrypt.hash(password, 10),
    },
    include: {
      userSessions: true,
    },
  })
  escapeUserSecrets(user)
  return user
}

export const createUserSession = (userId: number) =>
  prisma.userSession.create({
    data: {
      userId,
      sessionId: generateSessionId(),
    },
  })

export const updateUserPersonalData = (id: number, name: string, email: string) =>
  prisma.user.update({
    where: { id },
    data: {
      name,
      email,
    },
  })

export const updatePassword = async (id: number, password: string) =>
  prisma.user.update({
    where: { id },
    data: {
      password: await bcrypt.hash(password, 10),
    },
  })

export const deleteUser = (id: number) => prisma.user.delete({ where: { id } })

export const getUserWithUserTeamsById = async (id: number) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
    include: { userTeams: true },
  })
  escapeUserSecrets(user)
  return user
}

export const changeActiveUserTeam = (userId: number, userTeamId: number) =>
  prisma.user.update({
    where: { id: userId },
    data: { activeUserTeamId: userTeamId },
  })

export type UserWithUserTeamsActiveTeamAndChats = Awaited<
  ReturnType<typeof getUserWithUserTeamsActiveTeamAndChatsById>
>
export const getUserWithUserTeamsActiveTeamAndChatsById = async (id: number) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
    include: {
      userTeams: {
        include: {
          team: true,
        },
      },
      activeUserTeam: {
        include: {
          team: {
            include: {
              teamUsers: {
                include: {
                  user: true,
                },
              },
            },
          },
          chats: {
            include: {
              sharedWith: {
                include: {
                  user: true,
                },
              },
            },
            orderBy: { updatedAt: 'desc' },
          },
        },
      },
    },
  })
  escapeUserSecrets(user)
  return user
}

export const getUserWithChatsById = async (id: number) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
    include: {
      activeUserTeam: {
        include: {
          chats: { orderBy: { updatedAt: 'desc' } },
        },
      },
    },
  })
  escapeUserSecrets(user)
  return user
}
