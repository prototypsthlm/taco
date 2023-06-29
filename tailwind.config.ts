import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#5e5e5e',
        secondary: '#333232',
        accent: '#e2e8f0',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
} as Config
