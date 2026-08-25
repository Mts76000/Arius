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
        primaryLight: "#EAF3FF",
        fond: "#FBFBFD",
        gray: "#4B5563",
        grayLight: "#D1D5DB",
        purple: "#A855F7",
        purpleLight: "#FAF5FF",
        green: "#34C759",
        greenMedium: "#D1FAE5",
        greenLight: "#F2FCF7",
        orange: "#FF9502",
        orangeLight: "#FFF1DE",
        red: "#EF4444",
        redLight: "#FEE2E2",
        cream: "#FAF9F6",
        paper: "#F5F3EF",
        ink: "#111827",
        kraft: "#C69B6B",
        kraftLight: "#E9DCC9",
        warmGray: "#6B7280",
      },
      boxShadow: {
        base: "0px 8px 24px rgba(149, 157, 165, 0.2)",
        soft: "0 18px 40px rgba(17, 24, 39, 0.08)",
        phone: "0 25px 60px rgba(17, 24, 39, 0.16)",
      },
    },
  },
  plugins: [],
};
