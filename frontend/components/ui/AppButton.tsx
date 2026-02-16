import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";
import { Colors } from "@/constants/theme";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  | "link";
export type ButtonSize = "sm" | "md" | "lg";

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function AppButton({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  isLoading = false,
  style,
  textStyle,
}: AppButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        stylesByVariant[variant],
        stylesBySize[size],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
      accessibilityRole="button"
    >
      {isLoading ? (
        <ActivityIndicator color={textColorByVariant[variant]} />
      ) : (
        <Text
          style={[styles.textBase, textStylesByVariant[variant], textStyle]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.6,
  },
  textBase: {
    fontWeight: "700",
  },
});

const stylesBySize = StyleSheet.create({
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  md: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  lg: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
});

const stylesByVariant = StyleSheet.create({
  primary: {
    backgroundColor: Colors.light.tint,
  },
  secondary: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  danger: {
    backgroundColor: "#dc2626",
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  link: {
    backgroundColor: "transparent",
    paddingHorizontal: 0,
  },
});

const textColorByVariant: Record<ButtonVariant, string> = {
  primary: Colors.light.background,
  secondary: Colors.light.text,
  danger: Colors.light.background,
  ghost: Colors.light.text,
  link: Colors.light.tint,
};

const textStylesByVariant = StyleSheet.create({
  primary: {
    color: textColorByVariant.primary,
    fontSize: 16,
  },
  secondary: {
    color: textColorByVariant.secondary,
    fontSize: 14,
  },
  danger: {
    color: textColorByVariant.danger,
    fontSize: 14,
  },
  ghost: {
    color: textColorByVariant.ghost,
    fontSize: 14,
  },
  link: {
    color: textColorByVariant.link,
    fontSize: 14,
  },
});
