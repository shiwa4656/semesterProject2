/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#1F1B2E",
        primary: "#F39C12",
        secondary: "#E67E22",
        cardBg: "#2E2B3B",
        textLight: "#E0E0E0",
      },
    },
  },
  plugins: [],
};
