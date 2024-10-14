import type { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  webServer: {
    command: 'npm run build && node server.js',
    url: 'http://localhost:3000',
  },
  reporter: 'html',
  use: {
    headless: true,
    trace: 'on',
    video: 'retain-on-failure',
    baseURL: 'http://localhost:3000',
  },
  testDir: 'tests',
  testMatch: /(.+\.)?(test|spec)\.[jt]s/,
}

export default config
