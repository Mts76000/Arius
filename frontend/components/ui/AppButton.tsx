import React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

interface AppButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function AppButton({
  title,
  onPress,
  disabled = false,
  isLoading = false,
  icon,
}: AppButtonProps) {
  const isDisabled = disabled || isLoading;
  const containerClassName =
    "w-full rounded-full items-center justify-center px-4 py-3 flex-row gap-2 bg-primary  " +
    (isDisabled ? "opacity-60" : "");

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      className={containerClassName}
    >
      {isLoading ? <ActivityIndicator color="#ffffff" /> : icon}
      {!isLoading && (
        <Text className="font-semibold text-l" style={{ color: "#ffffff" }}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
