/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js}",
    "./index.html"
  ],
  theme: {
    extend: {
      colors: {
        dark: "#1F1B2E",
        primary: "#F39C12",
        secondary: "#E67E22",
        cardBg: "#2E2B3B",
      },
    },
  },
  plugins: [],
}