import { faker } from '@faker-js/faker'
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { encrypt } from '../src/lib/server/utils/crypto'
import { Models } from '../src/lib/types/models'

const prisma = new PrismaClient()

async function seed() {
  if (process.env.DEPLOYMENT_ENV !== 'staging' && process.env.DEPLOYMENT_ENV !== 'development') {
    return
  }

  const email = 'user@prototyp.se'
  const teamName = 'Prototyp'

  const tables: { tablename: string }[] = await prisma.$queryRawUnsafe(
    `SELECT tablename
     FROM pg_catalog.pg_tables
     WHERE schemaname != 'pg_catalog'
       AND schemaname != 'information_schema'
       AND tablename != '_prisma_migrations';`
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
      name: 'user1',
      password: {
        create: {
          hash: await bcrypt.hash('password', 10),
        },
      },
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
      name: 'user2',
      password: {
        create: {
          hash: await bcrypt.hash('password', 10),
        },
      },
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

  for (let i = 3; i < 23; ++i) {
    await prisma.user.create({
      data: {
        email: `user${i}@prototyp.se`,
        name: `user${i}`,
        password: {
          create: {
            hash: bcrypt.hashSync('password', 10), // Note: Synchronously hashing password for simplicity
          },
        },
        userTeams: {
          create: {
            teamId: team1.id,
            role: Role.MEMBER,
          },
        },
      },
    })
  }

  await prisma.chat.create({
    data: {
      name: 'Test Chat',
      ownerId: user.userTeams[0].id,
      model: Models.gpt4,
      messages: {
        createMany: {
          data: [
            {
              question: 'Are you a helpful assistant?',
              authorId: user.id,
              answer: 'Yes I am.',
              model: Models.gpt4,
            },
          ],
        },
      },
    },
  })

  await prisma.chat.create({
    data: {
      name: 'Test Shared Chat',
      ownerId: user.userTeams[0].id,
      model: Models.gpt3,
      messages: {
        createMany: {
          data: [
            {
              model: Models.gpt3,
              question: 'Are you a helpful assistant?',
              authorId: user.id,
              answer: 'Yes of course.',
            },
            {
              model: Models.gpt4,
              question: 'Are you Sure about that??',
              authorId: userToShare.id,
              answer: 'No doubt.',
            },
          ],
        },
      },
      shared: true,
      sharedWith: {
        create: {
          userId: userToShare.id,
        },
      },
    },
  })

  await Promise.all(
    Array.from({ length: faker.number.int({ min: 495, max: 505 }) }).map(async () => {
      await prisma.chat.create({
        data: {
          name: `Chat ${faker.lorem.words(3)}`,
          ownerId: user.userTeams[0].id,
          model: faker.datatype.boolean() ? Models.gpt3 : Models.gpt4,
          messages: {
            createMany: {
              data: Array.from({ length: faker.number.int({ min: 95, max: 105 }) }, () => ({
                model: faker.datatype.boolean() ? Models.gpt3 : Models.gpt4,
                question: faker.lorem.sentence(),
                authorId: user.id,
                answer: faker.lorem.sentence(),
              })),
            },
          },
        },
      })
    })
  )
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
