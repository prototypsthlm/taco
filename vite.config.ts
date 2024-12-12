import { sentrySvelteKit } from '@sentry/sveltekit'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import { mjmlPluginVite } from './mjmlPluginVite'
import { txtPluginVite } from './txtPluginVite'
import { webSocketServer } from './webSocketPluginVite'

export default defineConfig({
  plugins: [
    sentrySvelteKit(),
    sveltekit(),
    webSocketServer,
    mjmlPluginVite(),
    txtPluginVite(),
  ],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
  ssr: {
    noExternal: ['sorcery'],
  },
})
