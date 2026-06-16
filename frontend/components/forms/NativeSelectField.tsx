import React, { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { PickerFrame } from "@/components/forms/Form";

export type NativeSelectOption<T extends string | number> = {
  label: string;
  value: T;
};

interface NativeSelectFieldProps<T extends string | number> {
  value: T;
  options: NativeSelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
}

export function NativeSelectField<T extends string | number>({
  value,
  options,
  onChange,
  placeholder = "Sélectionner",
  disabled = false,
  error = false,
}: NativeSelectFieldProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = useMemo(
    () => options.find((option) => option.value === value)?.label,
    [options, value],
  );

  if (Platform.OS !== "ios") {
    return (
      <PickerFrame disabled={disabled} error={error}>
        <Picker
          selectedValue={value}
          onValueChange={(nextValue) => onChange(nextValue as T)}
          enabled={!disabled}
        >
          {options.map((option) => (
            <Picker.Item
              key={String(option.value)}
              label={option.label}
              value={option.value}
            />
          ))}
        </Picker>
      </PickerFrame>
    );
  }

  return (
    <>
      <TouchableOpacity
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => setIsOpen(true)}
        className={`min-h-12 flex-row items-center justify-between rounded-lg border bg-white px-4 ${
          error ? "border-red-500 bg-red-50" : "border-slate-300"
        } ${disabled ? "opacity-60" : ""}`}
      >
        <Text
          className={`text-base ${
            selectedLabel ? "text-slate-900" : "text-slate-400"
          }`}
          numberOfLines={1}
        >
          {selectedLabel || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#64748B" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/30"
          onPress={() => setIsOpen(false)}
        >
          <Pressable
            className="rounded-t-3xl bg-white pb-6"
            onPress={(event) => event.stopPropagation()}
          >
            <View className="flex-row items-center justify-between border-b border-slate-100 px-5 py-3">
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text className="text-base font-semibold text-slate-500">
                  Annuler
                </Text>
              </TouchableOpacity>
              <Text className="text-base font-semibold text-slate-900">
                {placeholder}
              </Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text className="text-base font-semibold text-primary">
                  OK
                </Text>
              </TouchableOpacity>
            </View>

            <Picker
              selectedValue={value}
              onValueChange={(nextValue) => onChange(nextValue as T)}
            >
              {options.map((option) => (
                <Picker.Item
                  key={String(option.value)}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </Picker>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
