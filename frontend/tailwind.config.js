/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff6b6b',
        secondary: '#4ecdc4',
        dark: {
          100: '#2d2d44',
          200: '#252538',
          300: '#1e1e2e',
          400: '#16213e',
          500: '#1a1a2e'
        }
      }
    },
  },
  plugins: [],
}
