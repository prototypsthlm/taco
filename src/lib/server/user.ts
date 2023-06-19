import { prisma } from '$lib/prisma'
import { Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

export const getUserByEmail = async (email: string) => {
  return prisma.user.findUniqueOrThrow({ where: { email } })
}

export const getUserById = async (id: number) => {
  return prisma.user.findUniqueOrThrow({ where: { id } })
}

export const createUser = async (email: string, password: string, teamName: string) => {
  return prisma.user.create({
    data: {
      email,
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
