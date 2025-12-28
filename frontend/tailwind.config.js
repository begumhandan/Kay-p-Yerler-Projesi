/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sepia-dark': '#4a4036',
        'sepia-light': '#f5f0e1',
        'brand-red': '#e63946',
      }
    },
  },
  plugins: [],
}