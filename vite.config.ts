import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import { webSocketServer } from './webSocketPluginVite'

export default defineConfig({
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  plugins: [sveltekit(), webSocketServer],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
})
