import { prisma } from '$lib/server/prisma'
import { generateSessionId } from '$lib/server/utils/crypto'
import { Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

export const getUserWithRelationsById = (id: number) =>
  prisma.user.findUniqueOrThrow({
    where: { id },
    include: {
      userTeams: {
        include: {
          team: true,
        },
      },
    },
  })

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

  return user
}

export const setSessionId = (id: number) => {
  return prisma.user.update({ data: { sessionId: generateSessionId() }, where: { id } })
}

export const createUser = async (
  name: string,
  email: string,
  password: string,
  teamName: string
) => {
  const team = await prisma.team.findUnique({ where: { name: teamName } })
  return prisma.user.create({
    data: {
      email,
      name,
      sessionId: generateSessionId(),
      password: await bcrypt.hash(password, 10),
      userTeams: {
        create: {
          role: team ? Role.ADMIN : Role.MEMBER,
          team: {
            connectOrCreate: {
              where: {
                name: teamName,
              },
              create: {
                name: teamName,
              },
            },
          },
        },
      },
    },
  })
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

export const getUserWithUserTeamsById = async (id: number) =>
  prisma.user.findUniqueOrThrow({
    where: { id },
    include: { userTeams: { include: { team: true } } },
  })

export const changeActiveUserTeam = (userId: number, userTeamId: number) =>
  prisma.user.update({
    where: { id: userId },
    data: { activeUserTeamId: userTeamId },
  })

export type UserWithTeamsAndTeamUsers = Awaited<ReturnType<typeof getUserWithTeamsAndTeamUsersById>>
export type UserTeamWithTeamsAndTeamUsers = UserWithTeamsAndTeamUsers['userTeams'][number]

export const getUserWithTeamsAndTeamUsersById = (id: number) =>
  prisma.user.findUniqueOrThrow({
    where: { id },
    include: {
      userTeams: {
        include: {
          chats: { orderBy: { updatedAt: 'desc' } },
          team: {
            include: {
              teamUsers: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
    },
  })

export type UserWithUserTeamsActiveTeamAndChats = Awaited<
  ReturnType<typeof getUserWithUserTeamsActiveTeamAndChatsById>
>
export const getUserWithUserTeamsActiveTeamAndChatsById = (id: number) =>
  prisma.user.findUniqueOrThrow({
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

export const getUserWithChatsById = (id: number) =>
  prisma.user.findUniqueOrThrow({
    where: { id },
    include: {
      activeUserTeam: {
        include: {
          chats: { orderBy: { updatedAt: 'desc' } },
        },
      },
    },
  })

export const getUserWithActiveUserTeamById = (id: number) =>
  prisma.user.findUniqueOrThrow({
    where: { id },
    include: {
      activeUserTeam: true,
    },
  })
