import { prisma } from '$lib/prisma'
import { generateSessionId } from '$lib/utils/crypto'
import { Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

export const getUserWithRelationsById = async (id: number) => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      userTeams: {
        include: {
          team: true,
        },
      },
    },
  })
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
