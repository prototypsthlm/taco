import { PrismaClient, Role } from '@prisma/client'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seed() {
  const email = 'user@prototyp.se'
  const teamName = 'Prototyp'

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  })
  await prisma.team.delete({ where: { name: teamName } }).catch(() => {
    // no worries if it doesn't exist yet
  })

  const user = await prisma.user.create({
    data: {
      email,
      name: 'Prototyp User',
      password: await bcrypt.hash('password', 10),
      userTeams: {
        create: {
          role: Role.ADMIN,
          team: {
            create: {
              name: 'Prototyp',
            },
          },
        },
      },
    },
    include: {
      userTeams: true,
    },
  })

  await prisma.chat.create({
    data: {
      name: 'Test Chat',
      ownerId: user.userTeams[0].id,
      messages: {
        createMany: {
          data: [
            {
              question: 'OGOGAre you a helpful assistant?',
              authorId: user.id,
            },
          ],
        },
      },
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
