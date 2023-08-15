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
  prisma.user.findUniqueOrThrow({
    where: { sessionId },
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

export const setSessionId = (id: number) => {
  return prisma.user.update({ data: { sessionId: generateSessionId() }, where: { id } })
}

export const createUser = async (name: string, email: string, password: string) => {
  const user = await prisma.user.create({
    data: {
      email,
      name,
      sessionId: generateSessionId(),
      password: await bcrypt.hash(password, 10),
    },
  })
  escapeUserSecrets(user)
  return user
}

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
  const user = prisma.user.findUniqueOrThrow({
    where: { id },
    include: {
      userTeams: {
        include: {
          team: true,
        },
      },
      activeUserTeam: {
        include: {
          team: true,
          chats: { orderBy: { updatedAt: 'desc' } },
        },
      },
    },
  })
  escapeUserSecrets(user)
  return user
}

export const getUserWithChatsById = async (id: number) => {
  const user = prisma.user.findUniqueOrThrow({
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

export const getUserWithActiveUserTeamById = async (id: number) => {
  const user = prisma.user.findUniqueOrThrow({
    where: { id },
    include: {
      activeUserTeam: true,
    },
  })
  escapeUserSecrets(user)
  return user
}
