import { expect, test } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { cleanDatabase } from '../prisma/helpers'
import { PrismaClient, Role } from '@prisma/client'
import { encrypt } from '../src/lib/server/utils/crypto'
import pkg from 'bcryptjs'

const { hashSync } = pkg
const prisma = new PrismaClient()

type Team = {
  id: number
  name: string
  openAiApiKey: string | null
  createdAt: Date
  updatedAt: Date
}

async function createTeam(name: string) {
  return await prisma.team.create({
    data: {
      name: name,
      openAiApiKey:
        process.env.OPENAI_API_KEY && process.env.SECRET_KEY
          ? encrypt(process.env.OPENAI_API_KEY, process.env.SECRET_KEY)
          : null,
    },
  })
}

async function createUser(team: Team) {
  const email = 'user@prototyp.se'
  return await prisma.user.create({
    data: {
      email,
      name: 'Test1',
      password: {
        create: {
          hash: hashSync('password', 10),
        },
      },
      userTeams: {
        create: {
          teamId: team.id,
          role: Role.OWNER,
        },
      },
    },
    include: {
      userTeams: true,
    },
  })
}

export const getTeamByName = async (name: string) => {
  return prisma.team.findUnique({
    where: {
      name,
    },
  })
}

/* 
async function createChat() {
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
} */

test.describe('app flow tests', () => {
  const name = faker.person.firstName()
  const email = faker.internet.email()
  const password = faker.internet.password()

  test.beforeEach(async () => {
    await cleanDatabase()
  })

  test('register flow', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Register').click()
    await expect(page).toHaveURL('/signup')

    await page.getByLabel('Name').fill(name)
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByLabel('Confirm Password').fill(password)

    await page.getByText('Sign up').click()

    await page.waitForURL('/app/settings/teams')

    await expect(page).toHaveURL('/app/settings/teams')
  }),
    test('login flow', async ({ page }) => {
      let team = await createTeam('Test Team')
      let user = await createUser(team)

      await page.goto('/')
      await page.getByText('Sign in').click()
      await expect(page).toHaveURL('/signin')

      await page.getByLabel('Email').fill(user.email)
      await page.getByLabel('Password', { exact: true }).fill('password')
      await page.getByRole('button').click()

      await page.waitForURL('/app/settings/teams')

      await expect(page).toHaveURL('/app/settings/teams')
    }),
    test('create a team', async ({ page }) => {
      let team = await createTeam('Test Team')
      let user = await createUser(team)
      let teamFromDb

      //log in
      await page.goto('/')
      await page.getByText('Sign in').click()
      await expect(page).toHaveURL('/signin')

      await page.getByLabel('Email').fill(user.email)
      await page.getByLabel('Password', { exact: true }).fill('password')
      await page.getByRole('button').click()

      await page.waitForURL('/app/settings/teams')

      await expect(page).toHaveURL('/app/settings/teams')

      //close popup
      await page.getByRole('button', { name: /Close/i }).click()

      //create new team
      await page.getByText('New Team').click()
      await expect(page).toHaveURL('/app/settings/teams/new')

      await page.getByLabel('Name*').fill('Test Team 2')
      await page.getByLabel('OpenAI API Key*').fill(process.env.OPENAI_API_KEY || '')
      await page.getByRole('button').click()

      await page.waitForTimeout(1000)
      teamFromDb = await getTeamByName('Test Team 2')

      await page.waitForURL(`app/settings/teams/${teamFromDb?.id}`)
      await expect(page).toHaveURL(`app/settings/teams/${teamFromDb?.id}`)
    })
})
