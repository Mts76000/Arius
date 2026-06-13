import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
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

interface FormSectionProps {
  children: React.ReactNode;
  className?: string;
}

interface ChoiceChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  className?: string;
  selectedClassName?: string;
  selectedTextClassName?: string;
  style?: object;
  textStyle?: object;
}

interface CheckboxRowProps {
  label: string;
  checked: boolean;
  onPress: () => void;
  disabled?: boolean;
}

interface PickerFrameProps {
  children: React.ReactNode;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export function Form({ children }: FormProps) {
  return (
    <View
      className="w-full gap-5 px-5 pt-6"
      style={{ maxWidth: 820, alignSelf: "center" }}
    >
      {children}
    </View>
  );
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
    <View className="px-5 pt-4 pb-3 border-b border-gray-100 bg-white">
      <View className="flex-row items-center justify-between">
        <AppButton
          title="Annuler"
          onPress={onCancel}
          variant="link"
          disabled={cancelDisabled}
          fullWidth={false}
          className="px-0 py-1"
        />
        <Text
          numberOfLines={1}
          className="mx-3 flex-1 text-center text-lg font-bold text-gray-950"
        >
          {title}
        </Text>
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
    <View className="gap-2.5">
      {title ? (
        <Text className="text-sm font-semibold text-gray-700">
          {title}
          {required ? " *" : ""}
        </Text>
      ) : null}
      {children}
      {error ? (
        <Text className="text-sm font-medium text-red-700">{error}</Text>
      ) : null}
    </View>
  );
}

export function FormSection({ children, className }: FormSectionProps) {
  return (
    <View
      className={`mx-5 my-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm gap-4 ${
        className ?? ""
      }`}
    >
      {children}
    </View>
  );
}

export function ChoiceChip({
  label,
  selected,
  onPress,
  disabled = false,
  className,
  selectedClassName = "bg-primary border-primary",
  selectedTextClassName = "text-white font-semibold",
  style,
  textStyle,
}: ChoiceChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`min-h-11 rounded-lg border px-4 py-2.5 items-center justify-center ${
        selected ? selectedClassName : "bg-white border-slate-200"
      } ${disabled ? "opacity-60" : ""} ${className ?? ""}`}
      style={style}
    >
      <Text
        className={selected ? selectedTextClassName : "text-gray-700 font-medium"}
        style={textStyle}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function CheckboxRow({
  label,
  checked,
  onPress,
  disabled = false,
}: CheckboxRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center gap-3 rounded-lg border px-3 py-3 ${
        checked ? "border-primary/30 bg-primaryLight" : "border-slate-200 bg-slate-50"
      } ${
        disabled ? "opacity-60" : ""
      }`}
    >
      <View
        className={`h-6 w-6 rounded-lg border items-center justify-center ${
          checked ? "bg-primary border-primary" : "bg-white border-gray-300"
        }`}
      >
        {checked && <Text className="text-white text-xs font-bold">✓</Text>}
      </View>
      <Text className="text-gray-800 font-medium">{label}</Text>
    </TouchableOpacity>
  );
}

export function PickerFrame({
  children,
  disabled = false,
  error = false,
  className,
}: PickerFrameProps) {
  return (
    <View
      className={`min-h-12 justify-center overflow-hidden rounded-lg border ${
        error ? "border-red-500 bg-red-50" : "border-slate-300 bg-white"
      } ${disabled ? "opacity-60" : ""} ${className ?? ""}`}
    >
      {children}
    </View>
  );
}
