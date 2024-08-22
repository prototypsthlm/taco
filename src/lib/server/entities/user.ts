import { dev } from '$app/environment'
import { createNotification, markVerifyNotificationAsRead } from '$lib/server/entities/notification'
import { prisma } from '$lib/server/prisma'
import { generateSecureRandomToken } from '$lib/server/utils/crypto'
import type { Prisma } from '@prisma/client'
import { NotificationType, Role } from '@prisma/client'
import type { Cookies } from '@sveltejs/kit'
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
      activeUserTeam: {
        include: {
          team: true,
        },
      },
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

export const getUserByVerifyToken = (verificationToken: string) =>
  prisma.user.findFirst({
    where: {
      password: {
        verificationToken,
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
          verificationToken: generateSecureRandomToken(),
        },
      },
      notifications: {
        create: {
          type: NotificationType.VERIFY_EMAIL,
          title: 'Welcome to TACO!',
          body: 'Please check your email and verify your address.',
        },
      },
    },
    include: {
      userSessions: true,
      password: true,
    },
  })

export const createUserSession = (userId: number) =>
  prisma.userSession.create({
    data: {
      userId,
      sessionId: generateSecureRandomToken(),
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

export const isUserVerified = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      password: true,
    },
  })
  return user?.password?.verificationToken === null
}

export const userHasNotificationOfTypeAsRead = async (
  id: number,
  notificationType: NotificationType
) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      notifications: true,
    },
  })

  return !!user?.notifications.some(
    (notification) => notification.type === notificationType && notification.read === true
  )
}

export const markVerifyUserNotificationAsUnread = async (id: number) => {
  await prisma.notification.updateMany({
    where: {
      type: NotificationType.VERIFY_EMAIL,
      userId: id,
    },
    data: {
      read: false,
    },
  })
}

export const markUserAsVerified = async (id: number) => {
  await prisma.user.update({
    where: { id: id },
    data: {
      password: {
        update: {
          verificationToken: null,
        },
      },
    },
  })

  await markVerifyNotificationAsRead(id)

  await createNotification(
    'Email verified',
    'Your email has been verified',
    id,
    NotificationType.GENERAL
  )
}

export const createUserSessionAndCookie = async (
  userId: number,
  cookies: Cookies,
  remember = false
) => {
  const { sessionId } = await createUserSession(userId)

  cookies.set('session_id', sessionId, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: !dev,
    maxAge: remember ? 60 * 60 * 24 * 7 : undefined, // one week or undefined
  })
}
