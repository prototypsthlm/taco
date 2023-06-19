import { prisma } from '$lib/prisma'
import { generateSessionId } from '$lib/utils/crypto'
import { Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

export const getUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } })
}

export const getUserById = async (id: number) => {
  return prisma.user.findUnique({ where: { id } })
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

export const createUser = async (
  name: string,
  email: string,
  password: string,
  teamName: string
) => {
  return prisma.user.create({
    data: {
      email,
      name,
      sessionId: generateSessionId(),
      password: await bcrypt.hash(password, 10),
      userTeams: {
        create: {
          role: Role.ADMIN,
          team: {
            create: {
              name: teamName,
            },
          },
        },
      },
    },
  })
}
