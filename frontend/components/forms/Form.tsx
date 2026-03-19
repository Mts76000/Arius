import React from "react";
import { View, Text } from "react-native";
import { AppButton } from "@/components/ui/AppButton";

interface FormProps {
  children: React.ReactNode;
}

interface FormHeaderProps {
  title: string;
  onCancel: () => void;
  onSave: () => void;
  isSaving?: boolean;
  cancelDisabled?: boolean;
  saveDisabled?: boolean;
  saveLabel?: string;
  savingLabel?: string;
}

interface FormGroupProps {
  title?: string;
  required?: boolean;
  error?: string | null;
  children: React.ReactNode;
}

export function Form({ children }: FormProps) {
  return <View className=" pt-10 pl-5 pr-5  gap-4">{children}</View>;
}

export function FormHeader({
  title,
  onCancel,
  onSave,
  isSaving = false,
  cancelDisabled = false,
  saveDisabled = false,
  saveLabel = "Enregistrer",
  savingLabel = "...",
}: FormHeaderProps) {
  return (
    <View className="px-5 pt-4 pb-3 border-b border-gray-200 bg-white">
      <View className="flex-row items-center justify-between">
        <AppButton
          title="Annuler"
          onPress={onCancel}
          variant="link"
          disabled={cancelDisabled}
          fullWidth={false}
          className="px-0 py-1"
        />
        <Text className="text-lg font-bold text-gray-900">{title}</Text>
        <AppButton
          title={isSaving ? savingLabel : saveLabel}
          onPress={onSave}
          disabled={saveDisabled}
          variant="link"
          fullWidth={false}
          className="px-0 py-1"
        />
      </View>
    </View>
  );
}

export function FormGroup({
  title,
  required = false,
  error,
  children,
}: FormGroupProps) {
  return (
    <View className="gap-2">
      {title ? (
        <Text className="text-sm font-medium text-gray-700">
          {title}
          {required ? " *" : ""}
        </Text>
      ) : null}
      {children}
      {error ? <Text className="text-red-500 text-sm">{error}</Text> : null}
    </View>
  );
}
