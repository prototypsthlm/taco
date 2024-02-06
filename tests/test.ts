import { expect, test } from '@playwright/test'
import { cleanDatabase } from '../prisma/helpers'

test.describe('Feature that interacts with the DB', () => {
  test.beforeEach(async () => {
    await cleanDatabase()
  })

  test('should perform a test that touches the database', async ({ page }) => {
    await page.goto('/signup')

    await page.getByLabel('Name').fill('Test User')
    await page.getByLabel('Email').fill('testuser@example.com')
    await page.getByLabel('Password', { exact: true }).fill('password123')
    await page.getByLabel('Confirm Password').fill('password123')

    await page.getByText('Sign up').click()

    await page.waitForURL('/app/settings/teams', { timeout: 60000, waitUntil: 'networkidle' })

    await expect(page).toHaveURL('/app/settings/teams')
  })
})
