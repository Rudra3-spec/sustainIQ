/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: "#052c24",
        leaf: "#2d6a4f",
      },
    },
  },
  plugins: [],
};
