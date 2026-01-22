import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from "react-native";

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
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={showToggle ? isHidden : secureTextEntry}
          keyboardType={keyboardType}
          {...props}
        />
        {showToggle && (
          <TouchableOpacity
            onPress={() => setIsHidden((prev) => !prev)}
            style={styles.toggleButton}
            accessibilityRole="button"
            accessibilityLabel={
              isHidden ? "Afficher le mot de passe" : "Masquer le mot de passe"
            }
          >
            <Text style={styles.toggleText}>
              {isHidden ? "Afficher" : "Cacher"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    paddingRight: 72,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#000",
  },
  toggleButton: {
    position: "absolute",
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  toggleText: {
    color: "#2563eb",
    fontWeight: "600",
  },
  inputError: {
    borderColor: "#dc2626",
    backgroundColor: "#fef2f2",
  },
  errorText: {
    fontSize: 12,
    color: "#dc2626",
    marginTop: 4,
  },
});
