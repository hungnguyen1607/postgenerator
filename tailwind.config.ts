import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        linkedin: {
          primary: '#0a66c2',
          hover: '#004182',
        },
      },
    },
  },
  plugins: [],
}

export default config
