/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-lato)', 'sans-serif'],
        serif: ['var(--font-playfair-display)', 'serif'],
      },
      // --- MODIFIED: Added the full color palette from v2.html ---
      colors: {
        theme: {
          primary: {
            bg: '#3d5a80',
            text: '#ffffff',
          },
          accent: {
            bg: 'rgba(77, 171, 247, 0.1)',
            text: '#4dabf7',
            border: 'rgba(77, 171, 247, 0.4)',
          },
          correct: {
            bg: 'rgba(38, 166, 154, 0.1)',
            text: '#26a69a',
            border: 'rgba(38, 166, 154, 0.4)',
          },
          incorrect: {
            bg: 'rgba(239, 83, 80, 0.1)',
            text: '#ef5350',
            border: 'rgba(239, 83, 80, 0.4)',
          },
        },
      },
    },
  },
  plugins: [],
};