/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#12121a",
        surface: "#1c1c26",
        surface2: "#23232f",
        border: "#33333f",
        gold: "#e8a13a",
        green: "#2f9e6e",
        red: "#e2543f",
        cream: "#f3efe6",
        dim: "#9a97a6"
      }
    }
  },
  plugins: []
};
