/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "#0A0A0F",
        surface: "#13131A",
        primary: "#7C6FFF",
        accent: "#FF6B9D",
      }
    }
  },
  plugins: [],
};
