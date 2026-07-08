/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#ffffff",
        surface: "#ffffff",
        surface2: "#f3f3f6",
        border: "#e4e4ea",
        gold: "#d98a1f",
        green: "#1f8a5c",
        red: "#d84a37",
        cream: "#18181f",
        dim: "#6b6b78",
        ink: "#18181f"
      }
    }
  },
  plugins: []
};
