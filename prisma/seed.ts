import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function seed() {
  const email = 'user@prototyp.se'

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  })

  await prisma.user.create({
    data: {
      email,
      name: 'Prototyp User',
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
      userTeams: {
        include: {
          team: true,
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
