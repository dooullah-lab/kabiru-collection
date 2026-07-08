/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#f7f5ef",
        surface: "#ffffff",
        surface2: "#efece3",
        border: "#e2ddd0",
        gold: "#d98a1f",
        green: "#1f8a5c",
        red: "#d84a37",
        cream: "#1c1a15",
        dim: "#75705f",
        ink: "#1c1a15",
        navy: "#5b9bd5"
      }
    }
  },
  plugins: []
};
