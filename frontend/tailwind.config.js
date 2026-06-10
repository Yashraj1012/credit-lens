/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bbdffd',
          300: '#7cc2fd',
          400: '#36a2fa',
          500: '#0c85eb',
          600: '#0266c8',
          700: '#0351a2',
          800: '#074585',
          900: '#0c3b6f',
          950: '#08254b',
        },
        slate: {
          850: '#1e293b',
          950: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
