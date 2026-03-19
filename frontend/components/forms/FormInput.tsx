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

  return (
    <View className="w-full">
      {label && (
        <Text className=" font-medium text-gray-700 pb-2 ">{label}</Text>
      )}
      <View>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={showToggle ? isHidden : secureTextEntry}
          keyboardType={keyboardType}
          {...props}
          className={`border-[0.3px] border-grayLight rounded-full px-4 py-3 w-full bg-white  ${
            showToggle ? "pr-12" : ""
          }`}
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
              top: "50%",
              transform: [{ translateY: -10 }],
            }}
          >
            <Ionicons
              name={isHidden ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="black"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="text-red-500 text-sm pt-2">{error}</Text>}
    </View>
  );
};
