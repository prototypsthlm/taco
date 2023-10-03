import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { encrypt } from '../src/lib/server/utils/crypto'

const prisma = new PrismaClient()

async function seed() {
  if (process.env.DEPLOYMENT_ENV !== 'staging' && process.env.DEPLOYMENT_ENV !== 'development') {
    return
  }

  const email = 'user@prototyp.se'
  const teamName = 'Prototyp'

  const tables: { tablename: string }[] = await prisma.$queryRawUnsafe(
    `SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema' AND tablename != '_prisma_migrations';`
  )

  for (const { tablename } of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE;`)
  }

  const team1 = await prisma.team.create({
    data: {
      name: teamName,
      openAiApiKey:
        process.env.OPENAI_API_KEY && process.env.SECRET_KEY
          ? encrypt(process.env.OPENAI_API_KEY, process.env.SECRET_KEY)
          : null,
    },
  })

  const user = await prisma.user.create({
    data: {
      email,
      name: 'Prototyp User',
      password: await bcrypt.hash('password', 10),
      userTeams: {
        create: {
          teamId: team1.id,
          role: Role.OWNER,
        },
      },
    },
    include: {
      userTeams: true,
    },
  })

  const userToShare = await prisma.user.create({
    data: {
      email: 'user2@prototyp.se',
      name: 'Prototyp User 2',
      password: await bcrypt.hash('password', 10),
      userTeams: {
        create: {
          role: Role.OWNER,
          team: {
            create: {
              name: 'Prototyp 2',
              openAiApiKey:
                process.env.OPENAI_API_KEY && process.env.SECRET_KEY
                  ? encrypt(process.env.OPENAI_API_KEY, process.env.SECRET_KEY)
                  : null,
            },
          },
        },
      },
    },
    include: {
      userTeams: true,
    },
  })

  // Bulk insert users
  await prisma.user.createMany({
    data: Array.from({ length: 10 }, (_, i) => ({
      email: `bulk-user${i + 3}@prototyp.se`,
      name: `Prototyp User ${i + 3}`,
      password: bcrypt.hashSync('password', 10), // Note: Synchronously hashing password for simplicity
    })),
  })

  // Then connect them to a team
  const createdUsers = await prisma.user.findMany({
    where: {
      email: {
        startsWith: 'bulk-user',
      },
    },
  })

  for (const user of createdUsers) {
    await prisma.userTeam.create({
      data: {
        userId: user.id,
        teamId: team1.id,
        role: Role.MEMBER,
      },
    })
  }

  const chat = await prisma.chat.create({
    data: {
      name: 'Test Chat',
      ownerId: user.userTeams[0].id,
      messages: {
        createMany: {
          data: [
            {
              question: 'Are you a helpful assistant?',
              authorId: user.id,
              answer: 'Yes I am.',
            },
          ],
        },
      },
    },
  })

  const sharedChat = await prisma.chat.create({
    data: {
      name: 'Test Shared Chat',
      ownerId: user.userTeams[0].id,
      messages: {
        createMany: {
          data: [
            {
              question: 'Are you a helpful assistant?',
              authorId: user.id,
              answer: 'Yes of course.',
            },
            {
              question: 'Are you Sure about that??',
              authorId: userToShare.id,
              answer: 'No doubt.',
            },
          ],
        },
      },
    },
  })

  await prisma.chatUser.create({
    data: {
      chatId: sharedChat.id,
      userId: userToShare.id,
    },
  })
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
