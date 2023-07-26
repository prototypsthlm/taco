import { prisma } from '$lib/server/prisma'
import { decrypt, generateSessionId } from '$lib/server/utils/crypto'
import { Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

export const getUserWithRelationsById = async (id: number) => {
  const userWithRelations = await prisma.user.findUnique({
    where: { id },
    include: {
      userTeams: {
        include: {
          team: true,
        },
      },
    },
  })

  if (!userWithRelations?.userTeams) {
    return userWithRelations
  }

  userWithRelations.userTeams = userWithRelations?.userTeams.map((userTeam) => {
    if (!userTeam?.team?.openAiApiKey) {
      return userTeam
    }

    if (!process.env.SECRET_KEY) {
      throw new Error('You must have SECRET_KEY set in your env.')
    }

    userTeam.team.openAiApiKey = decrypt(userTeam.team.openAiApiKey, process.env.SECRET_KEY)
    return userTeam
  })

  return userWithRelations
}

export const getUserBySessionId = async (sessionId: string) => {
  return prisma.user.findUnique({ where: { sessionId } })
}

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

export const updateUserPersonalData = (id: number, name: string, email: string) => {
  return prisma.user.update({
    where: { id },
    data: {
      name,
      email,
    },
  })
}

export const updatePassword = async (id: number, password: string) => {
  return prisma.user.update({
    where: { id },
    data: {
      password: await bcrypt.hash(password, 10),
    },
  })
}

export const deleteUser = (id: number) => {
  return prisma.user.delete({ where: { id } })
}

export const findAllTeamsFromUser = async (userId: number) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { userTeams: { include: { team: true } } },
  })

  return user.userTeams.map((userTeam) => userTeam.team)
}

export const changeActiveTeam = async (userId: number, teamId: number) => {
  return prisma.user.update({
    where: { id: userId },
    data: { activeTeamId: teamId },
  })
}
