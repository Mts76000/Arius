/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#007aff",
        fond: "#FBFBFD",
        gray: "#4B5563",
        grayLight: "#D1D5DB",
        purple: "#A855F7",
        purpleLight: "#FAF5FF",
        green: "#34C759",
        greenMedium: "#D1FAE5",
        greenLight: "#F2FCF7",
        orange: "#FF9502",
      },
      boxShadow: {
        base: "0px 8px 24px rgba(149, 157, 165, 0.2)",
      },
    },
  },
  plugins: [],
};
