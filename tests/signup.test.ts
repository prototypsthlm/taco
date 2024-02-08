import { expect, test } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { cleanDatabase } from '../prisma/helpers'

const name = faker.person.firstName()
const email = faker.internet.email()
const password = faker.internet.password()

test.describe(() => {
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
  })
})
