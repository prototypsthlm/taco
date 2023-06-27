import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: (theme) => ({
        primary: '#5e5e5e',
        secondary: '#333232',
        accent: '#e2e8f0',
        bg: theme.colors.gray['900'],
      }),
    },
  },
  plugins: [require('@tailwindcss/forms')],
} as Config
