/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#FAFAF8',
        surface: {
          DEFAULT: '#F0EEE7',
          raised: '#FFFFFF',
        },
        ink: {
          DEFAULT: '#1C2333',
          muted: '#5B6472',
        },
        accent: {
          DEFAULT: '#F0631E',
          dark: '#D95315',
          light: '#FDEEE7',
        },
        brandPurple: {
          DEFAULT: '#6C4CE0',
          light: '#F0ECFC',
        },
        brandTeal: {
          DEFAULT: '#2A6F6F',
          dark: '#1E4F4F',
          light: '#DCEAEA',
        },
        score: {
          low: '#C9D6D6',
          mid: '#6FA3A3',
          high: '#2A6F6F',
        },
        borderCustom: '#E2E0D8',
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
