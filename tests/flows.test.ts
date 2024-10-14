import { faker } from '@faker-js/faker'
import { expect, Page, test } from '@playwright/test'
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

async function loginFlow(page: Page) {
  const team = await createTeam('Test Team')
  const user = await createUser(team)

  await page.goto('/')
  await page.waitForURL('/')
  await page.getByTestId('goto-signin').click()
  await expect(page).toHaveURL(/.*signin.*/)

  await page.getByTestId('email').fill(user.email)
  await page.getByTestId('password').fill('password')
  await page.getByTestId('signin-button').click()

  await page.waitForURL('/app/settings/teams')

  await expect(page).toHaveURL('/app/settings/teams')
}

test.describe('register flow', () => {
  test('register new user successful', async ({ page }) => {
    const name = faker.person.firstName()
    const email = faker.internet.email()
    const password = faker.internet.password()

    // Navigate to the home page
    await page.goto('/')
    await expect(page).toHaveURL('/')

    // Click on the Register link
    await page.getByTestId('goto-signup').click()
    await expect(page).toHaveURL(/.*signup.*/)

    // Fill out the registration form
    await page.getByTestId('name').fill(name)
    await page.getByTestId('email').fill(email)
    await page.getByTestId('password').fill(password)
    await page.getByTestId('confirm-password').fill(password)

    await page.getByTestId('signup-button').click()

    await page.waitForURL('/app/settings/teams')
    await expect(page).toHaveURL('/app/settings/teams')
  })

  test('register new user unsuccessful with email validation error', async ({ page }) => {
    const name = faker.person.firstName()
    const invalidEmail = 'invalid-email'
    const password = faker.internet.password()

    // Navigate to the home page
    await page.goto('/')
    await expect(page).toHaveURL('/')

    // Click on the Register link
    await page.getByTestId('goto-signup').click()
    await expect(page).toHaveURL(/.*signup.*/)

    // Fill out the registration form
    await page.getByTestId('name').fill(name)
    await page.getByTestId('email').fill(invalidEmail)
    await page.getByTestId('password').fill(password)
    await page.getByTestId('confirm-password').fill(password)

    // Try to submit the form
    await page.getByTestId('signup-button').click()

    // Check for Zod email validation error message
    await expect(page.getByText('Invalid email')).toBeVisible()
  })

  test('register new user unsuccessful with password validation error', async ({ page }) => {
    const name = faker.person.firstName()
    const email = faker.internet.email()
    const password = faker.internet.password()
    const password2 = '123'

    // Navigate to the home page
    await page.goto('/')
    await expect(page).toHaveURL('/')

    // Click on the Register link
    await page.getByTestId('goto-signup').click()
    await expect(page).toHaveURL(/.*signup.*/)

    // Fill out the registration form
    await page.getByTestId('name').fill(name)
    await page.getByTestId('email').fill(email)
    await page.getByTestId('password').fill(password)
    await page.getByTestId('confirm-password').fill(password2)

    // Try to submit the form
    await page.getByTestId('signup-button').click()

    // Check for Zod email validation error message
    await expect(page.getByText(`Passwords don't match`)).toBeVisible()
  })
})

test.describe('login flow', () => {
  test.beforeEach(async () => {
    await cleanDatabase()
  })
  test('login with user successfully', async ({ page }) => {
    const team = await createTeam('Test Team')
    const user = await createUser(team)

    await page.goto('/')
    await page.waitForURL('/')
    await page.getByTestId('goto-signin').click()
    await expect(page).toHaveURL(/.*signin.*/)

    await page.getByTestId('email').fill(user.email)
    await page.getByTestId('password').fill('password')
    await page.getByTestId('signin-button').click()

    await page.waitForURL('/app/settings/teams')

    await expect(page).toHaveURL('/app/settings/teams')
  })
  test('login with invalid user details unsuccessfully', async ({ page }) => {
    const team = await createTeam('Test Team')

    await page.goto('/')
    await page.waitForURL('/')
    await page.getByTestId('goto-signin').click()
    await expect(page).toHaveURL(/.*signin.*/)

    await page.getByTestId('email').fill('invalid-email')
    await page.getByTestId('password').fill('invalid-password')
    await page.getByTestId('signin-button').click()

    await expect(page.getByText(`Invalid email`)).toBeVisible()

    await expect(page.getByText(`Wrong credentials`)).toBeVisible()
  })
})

test.describe('app setup flow', () => {
  test.beforeEach(async () => {
    await cleanDatabase()
  })
  test('create a new team', async ({ page }) => {
    await loginFlow(page)

    //close popup
    await page.getByTestId('dismiss-notification').click()

    //create new team
    await page.getByTestId('new-team-link').click()
    await page.waitForURL('/app/settings/teams/new')
    await expect(page).toHaveURL('/app/settings/teams/new')

    await page.getByTestId('name').fill('Test Team 2')
    await page.getByTestId('openAiApiKey').fill(process.env.OPENAI_API_KEY || '')
    await page.getByTestId('save-button').click()

    await page.waitForURL(new RegExp('app/settings/teams/\\d+'))
    await expect(page).toHaveURL(new RegExp('app/settings/teams/\\d+'))
  })

  test('create a chat', async ({ page }) => {
    await loginFlow(page)

    //select a team
    await page.getByTestId('select-team-button').click()
    await page.waitForURL('/app')
    await expect(page).toHaveURL('/app')

    //type
    await page.getByRole('textbox').fill('This is a test chat')
    //send
    await page.locator('button[name="send"]').click()

    await page.waitForTimeout(1000)
    await page.waitForURL(new RegExp('/app/chats/\\d+'))
    await expect(page).toHaveURL(new RegExp('/app/chats/\\d+'))
  })
})
