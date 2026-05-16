/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: '#07378d',
        'primary-dim': '#00318a',
        secondary: '#0fafee',
        'secondary-dim': '#0d9bdb',
        'unifal-bg': '#eef7fc',
        surface: '#111827',
        'on-surface': '#f3f4f6',
        'surface-variant': '#1f2937',
        'on-surface-variant': '#d1d5db',
      },
      fontFamily: {
        sans: ['"Public Sans"', 'sans-serif'],
        display: ['"Public Sans"', 'sans-serif'],
        body: ['"Public Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
