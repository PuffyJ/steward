/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0faf4',
          100: '#dcf2e4',
          200: '#b4e4c7',
          300: '#74c99a',
          400: '#3daa6f',
          500: '#1b8a52',
          600: '#1b6b42',
          700: '#1b4332',
          800: '#163526',
          900: '#0f2419',
        },
        sand: {
          50: '#faf8f5',
          100: '#f5f1eb',
          200: '#f0ede8',
          300: '#e8e4de',
          400: '#d1cdc5',
          500: '#b5b0a6',
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
