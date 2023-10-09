import { prisma } from '$lib/server/prisma'
import { generateSessionId } from '$lib/server/utils/crypto'
import type { Prisma } from '@prisma/client'
import { Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

export const getUserWithPasswordById = async (id: number) =>
  prisma.user.findUniqueOrThrow({
    where: { id },
    include: {
      password: true,
    },
  })

export type UserBySessionId = Prisma.PromiseReturnType<typeof getUserBySessionId>

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

export const getUserByEmail = (email: string) =>
  prisma.user.findUnique({
    where: { email },
  })

export const getUserByResetToken = (resetToken: string) =>
  prisma.user.findFirst({
    where: {
      password: {
        resetToken,
      },
    },
  })

export const updateResetTokenToUser = (userId: number, resetToken: string | null) =>
  prisma.user.update({
    where: { id: userId },
    data: {
      password: {
        update: {
          resetToken,
        },
      },
    },
  })

export const doesCredentialsMatch = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      password: true,
    },
  })

  if (!user?.password) {
    return false
  }

  return bcrypt.compare(password, user.password.hash)
}

export const createUser = async (name: string, email: string, password: string) =>
  prisma.user.create({
    data: {
      email,
      name,
      password: {
        create: {
          hash: await bcrypt.hash(password, 10),
        },
      },
    },
    include: {
      userSessions: true,
    },
  })

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
      password: {
        update: {
          hash: await bcrypt.hash(password, 10),
        },
      },
    },
  })

export const deleteUser = (id: number) => prisma.user.delete({ where: { id } })

export const getUserWithUserTeamsById = async (id: number) =>
  prisma.user.findUniqueOrThrow({
    where: { id },
    include: { userTeams: true },
  })

export const changeActiveUserTeam = (userId: number, userTeamId: number) =>
  prisma.user.update({
    where: { id: userId },
    data: { activeUserTeamId: userTeamId },
  })

export type UserWithUserTeamsActiveTeamAndChats = Prisma.PromiseReturnType<
  typeof getUserWithUserTeamsActiveTeamAndChatsById
>
export const getUserWithUserTeamsActiveTeamAndChatsById = async (id: number) =>
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
              owner: {
                include: {
                  user: true,
                },
              },
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
      sharedChats: {
        include: {
          user: true,
          chat: {
            include: {
              owner: {
                include: {
                  user: true,
                },
              },
              sharedWith: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
      notifications: {
        where: {
          read: false,
        },
      },
    },
  })

export const isUserAdmin = async (teamId: number, userId: number) => {
  const userTeam = await prisma.userTeam.findUnique({
    where: {
      userId_teamId: {
        userId: userId,
        teamId: teamId,
      },
      OR: [{ role: Role.ADMIN }, { role: Role.OWNER }],
    },
  })
  return !!userTeam
}

export const isUserInTeam = async (teamId: number, userId: number) => {
  const userTeam = await prisma.userTeam.findUnique({
    where: {
      userId_teamId: {
        userId: userId,
        teamId: teamId,
      },
    },
  })
  return !!userTeam
}

export const isUserOwningChat = async (chatId: number, userId: number) => {
  const chat = await prisma.chat.findUnique({
    where: {
      id: chatId,
      owner: {
        userId,
      },
    },
    include: {
      owner: true,
    },
  })
  return !!chat
}
