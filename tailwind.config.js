/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#121214',
          gray: '#202024',
          light: '#E1E1E6',
          blue: '#00B37E', // verde esmeralda tech
          accent: '#8257E5' // purple tech/azul
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
