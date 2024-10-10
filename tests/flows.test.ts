import { faker } from '@faker-js/faker'
import { expect, test } from '@playwright/test'
import { PrismaClient, Role } from '@prisma/client'
import pkg from 'bcryptjs'
import { cleanDatabase } from '../prisma/helpers'
import { encrypt } from '../src/lib/server/utils/crypto'

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
  return prisma.team.create({
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
  return prisma.user.create({
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

test.describe('app flow tests', () => {
  test.beforeEach(async () => {
    await cleanDatabase()
  })

  test('register flow', async ({ page }) => {
    const name = faker.person.firstName()
    const email = faker.internet.email()
    const password = faker.internet.password()

    await page.goto('/')
    await page.waitForURL('/')
    await page.getByText('Register').click()
    await page.waitForURL('/signup')
    await expect(page).toHaveURL('/signup')

    await page.getByLabel('Name').fill(name)
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByLabel('Confirm Password').fill(password)

    await page.getByRole('button', { name: 'Sign up' }).click()

    await page.waitForURL('/app/settings/teams')

    await expect(page).toHaveURL('/app/settings/teams')
  })

  test('login flow', async ({ page }) => {
    const team = await createTeam('Test Team')
    const user = await createUser(team)

    await page.goto('/')
    await page.waitForURL('/')
    await page.getByText('Sign in').click()
    await expect(page).toHaveURL('/signin/')

    await page.getByLabel('Email').fill(user.email)
    await page.getByLabel('Password', { exact: true }).fill('password')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await page.waitForURL('/app/settings/teams')

    await expect(page).toHaveURL('/app/settings/teams')
  })

  test('create a team', async ({ page }) => {
    const team = await createTeam('Test Team')
    const user = await createUser(team)

    //log in
    await page.goto('/')
    await page.waitForURL('/')
    await page.getByText('Sign in').click()
    await expect(page).toHaveURL('/signin')

    await page.getByLabel('Email').fill(user.email)
    await page.getByLabel('Password', { exact: true }).fill('password')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await page.waitForURL('/app/settings/teams')

    await expect(page).toHaveURL('/app/settings/teams')

    //close popup
    await page.getByRole('button', { name: /Close/i }).click()

    //create new team
    await page.getByText('New Team').click()
    await page.waitForURL('/app/settings/teams/new')
    await expect(page).toHaveURL('/app/settings/teams/new')

    await page.getByLabel('Name*').fill('Test Team 2')
    await page.getByLabel('OpenAI API Key*').fill(process.env.OPENAI_API_KEY || '')
    await page.getByText('Save').click()

    await page.waitForURL(new RegExp('app/settings/teams/\\d+'))
    await expect(page).toHaveURL(new RegExp('app/settings/teams/\\d+'))
  })

  test('create a chat', async ({ page }) => {
    const team = await createTeam('Test Team')
    const user = await createUser(team)

    //log in
    await page.goto('/')
    await page.waitForURL('/')
    await page.getByText('Sign in').click()
    await page.waitForURL('/signin')
    await expect(page).toHaveURL('/signin')

    await page.getByLabel('Email').fill(user.email)
    await page.getByLabel('Password', { exact: true }).fill('password')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.waitForURL('/app/settings/teams')

    await page.waitForURL('/app/settings/teams')

    await expect(page).toHaveURL('/app/settings/teams')
    //select a team
    await page.getByRole('button', { name: /Select/i }).click()
    await page.waitForURL('/app')
    await expect(page).toHaveURL('/app')

    //type
    await page.getByRole('textbox').fill('Dis a test chat')
    //send
    await page.locator('button[name="send"]').click()

    await page.waitForTimeout(1000)
    await page.waitForURL(new RegExp('/app/chats/\\d+'))
    await expect(page).toHaveURL(new RegExp('/app/chats/\\d+'))
  })
})
