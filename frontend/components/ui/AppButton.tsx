import React from "react";
import { Pressable, Text } from "react-native";
import { AppSpinner } from "@/components/ui/AppSpinner";

interface AppButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "link";
  fullWidth?: boolean;
  className?: string;
  textClassName?: string;
}

export function AppButton({
  title,
  onPress,
  disabled = false,
  isLoading = false,
  icon,
  variant = "primary",
  fullWidth = true,
  className,
  textClassName: customTextClassName,
}: AppButtonProps) {
  const isDisabled = disabled || isLoading;
  const baseClassName = `${fullWidth ? "w-full" : ""} rounded-full items-center justify-center px-4 py-3 flex-row gap-2`;

  const variantContainerClassName: Record<
    NonNullable<AppButtonProps["variant"]>,
    string
  > = {
    primary: "bg-primary",
    secondary: "bg-gray-200",
    danger: "bg-red-600",
    link: "bg-transparent",
  };

  const textClassName: Record<
    NonNullable<AppButtonProps["variant"]>,
    string
  > = {
    primary: "text-white",
    secondary: "text-gray-900",
    danger: "text-white",
    link: "text-primary",
  };

  const containerClassName =
    `${baseClassName} ${variantContainerClassName[variant]} ` +
    (isDisabled ? "opacity-60" : "") +
    ` ${className ?? ""}`;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      className={containerClassName}
    >
      {isLoading ? <AppSpinner color="light" /> : icon}
      {!isLoading && (
        <Text
          className={`text-base font-semibold ${customTextClassName ?? textClassName[variant]}`}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
