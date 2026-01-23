/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const primary = "#0ea5e9";
const primaryDark = "#0284c7";
const background = "#f8fafc";
const card = "#ffffff";
const textPrimary = "#0f172a";
const textMuted = "#64748b";
const border = "#e2e8f0";

export const Colors = {
  light: {
    text: textPrimary,
    background,
    tint: primary,
    icon: textMuted,
    tabIconDefault: textMuted,
    tabIconSelected: primary,
    card,
    border,
    muted: textMuted,
  },
  dark: {
    text: "#e2e8f0",
    background: "#0b1222",
    tint: primary,
    icon: "#94a3b8",
    tabIconDefault: "#94a3b8",
    tabIconSelected: primary,
    card: "#0f172a",
    border: "#1f2937",
    muted: "#94a3b8",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "SF Pro Rounded",
    serif: "Times New Roman",
    rounded: "SF Pro Rounded",
    mono: "SFMono-Regular",
  },
  default: {
    sans: "sans-serif",
    serif: "serif",
    rounded: "sans-serif",
    mono: "monospace",
  },
  web: {
    sans: "'Space Grotesk', 'Inter', 'DM Sans', 'SF Pro Display', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "'Libre Baskerville', Georgia, 'Times New Roman', serif",
    rounded:
      "'Manrope', 'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "'JetBrains Mono', 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
