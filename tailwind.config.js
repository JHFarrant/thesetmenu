/** @type {import('tailwindcss').Config} */
const flowbite = require("flowbite-react/tailwind");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    flowbite.content(),
  ],
  darkMode: "media",
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        "wa-background": "#e5ddd4",
        "wa-background-dark": "#0b1419",
        "wa-message-bg": "#d9fdd3",
        "wa-message-bg-dark": "#005c4b",
        "wa-link": "#027eb5",
        "wa-link-dark": "#53bdeb",
        "wa-message-primary": "#111b21",
        "wa-message-primary-dark": "#e9edef",
      },
    },
  },
  plugins: [flowbite.plugin()],
};
