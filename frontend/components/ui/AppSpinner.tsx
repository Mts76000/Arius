import React from "react";
import { ActivityIndicator, View } from "react-native";

type AppSpinnerProps = {
  size?: "small" | "large";
  color?: "primary" | "light";
  centered?: boolean;
};

const SPINNER_COLORS: Record<NonNullable<AppSpinnerProps["color"]>, string> = {
  primary: "#007aff",
  light: "#ffffff",
};

export function AppSpinner({
  size = "small",
  color = "primary",
  centered = false,
}: AppSpinnerProps) {
  const spinner = (
    <ActivityIndicator size={size} color={SPINNER_COLORS[color]} />
  );

  if (!centered) {
    return spinner;
  }

  return <View className="flex-1 items-center justify-center">{spinner}</View>;
}
