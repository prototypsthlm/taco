import type { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  webServer: {
    command: 'npm run build && node server.js',
    url: 'http://localhost:3000',
  },
  use: {
    baseURL: 'http://localhost:3000',
  },
  testDir: 'tests',
  testMatch: /(.+\.)?(test|spec)\.[jt]s/,
}

export default config
