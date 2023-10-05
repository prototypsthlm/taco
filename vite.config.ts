import { sentrySvelteKit } from "@sentry/sveltekit";
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import { webSocketServer } from './webSocketPluginVite'

export default defineConfig({
  plugins: [sentrySvelteKit({
    sourceMapsUploadOptions: {
      org: "prototyp-vm",
      project: "taco"
    }
  }), sveltekit(), webSocketServer],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
})