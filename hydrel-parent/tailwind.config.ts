// tailwind.config.js
// Required for Tailwind CSS integration in Next.js (run `npm install -D tailwindcss postcss autoprefixer` and `npx tailwindcss init -p` to initialize)
const { fontFamily } = require("tailwindcss/defaultTheme");

@type {import('tailwindcss').Config}
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", ...fontFamily.sans],
      },
    },
  },
  plugins: [],
};
export default config

