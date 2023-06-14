import { prisma } from '$lib/prisma'
import bcrypt from 'bcryptjs'

export const getUserByEmail = async (email: string) => {
  return prisma.user.findUniqueOrThrow({ where: { email } })
}

export const getUserById = async (id: number) => {
  return prisma.user.findUniqueOrThrow({ where: { id } })
}

export const createUser = async (email: string, password: string, companyName: string) => {
  return prisma.user.create({
    data: {
      email,
      password: await bcrypt.hash(password, 10),
      company: {
        create: {
          name: companyName,
        },
      },
    },
  })
}
