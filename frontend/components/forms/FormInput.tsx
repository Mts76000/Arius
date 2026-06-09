import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TextInputProps,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  value: string;
  onChangeText: (text: string) => void;
  enableVisibilityToggle?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  enableVisibilityToggle,
  ...props
}) => {
  const [isHidden, setIsHidden] = useState<boolean>(!!secureTextEntry);
  const showToggle = secureTextEntry && enableVisibilityToggle;
  const isMultiline = !!props.multiline;
  const isEditable = props.editable !== false;

  return (
    <View className="w-full gap-2">
      {label && (
        <Text className="text-sm font-semibold text-gray-700">{label}</Text>
      )}
      <View>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={showToggle ? isHidden : secureTextEntry}
          keyboardType={keyboardType}
          {...props}
          textAlignVertical={isMultiline ? "top" : props.textAlignVertical}
          className={`w-full border bg-white px-4 text-gray-900 ${
            isMultiline ? "min-h-28 py-3" : "min-h-12 py-3"
          } rounded-2xl ${error ? "border-red-400 bg-red-50" : "border-gray-200"} ${
            showToggle ? "pr-12" : ""
          } ${!isEditable ? "opacity-60" : ""}`}
        />
        {showToggle && (
          <TouchableOpacity
            onPress={() => setIsHidden((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel={
              isHidden ? "Afficher le mot de passe" : "Masquer le mot de passe"
            }
            style={{
              position: "absolute",
              right: 14,
              top: isMultiline ? 16 : "50%",
              transform: isMultiline ? [] : [{ translateY: -10 }],
            }}
          >
            <Ionicons
              name={isHidden ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#4b5563"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="text-red-600 text-sm">{error}</Text>}
    </View>
  );
};
