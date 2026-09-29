import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      brand: {
        ice: '#caf0f8',
        sky: '#90e0ef',
        cyan: '#00b4d8',
        ocean: '#0077b6',
        navy: '#03045e',
        50: '#caf0f8',
        100: '#90e0ef',
        300: '#00b4d8',
        500: '#0077b6',
        900: '#03045e',
      },
      ice: '#caf0f8',
      sky: '#90e0ef',
      cyan: '#00b4d8',
      ocean: '#0077b6',
      navy: '#03045e',
    },
    extend: {
      fontFamily: {
        heading: ['var(--font-grift)', 'Grift', 'sans-serif'],
        body: ['var(--font-archivo)', 'Archivo', 'sans-serif'],
        sans: ['var(--font-archivo)', 'Archivo', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 30px rgba(3, 4, 94, 0.04)',
        card: '0 12px 40px rgba(3, 4, 94, 0.06)',
        elevated: '0 20px 50px rgba(3, 4, 94, 0.08)',
      },
      borderWidth: {
        DEFAULT: '1px',
        0: '0px',
        1: '1px',
      },
      backgroundImage: {
        none: 'none',
      },
    },
  },
  plugins: [],
}

export default config
