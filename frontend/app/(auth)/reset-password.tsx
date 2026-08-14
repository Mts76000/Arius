import React, { useState } from "react";
import { ScrollView, Text, View, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AppButton } from "@/components/ui/AppButton";
import { FormInput } from "@/components/forms/FormInput";
import { FormErrors, hasErrors, ValidationRules } from "@/utils/validation";
import { useAuthStore } from "@/store/authStore";
import { AriusLogo } from "@/components/ui/AriusLogo";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const { resetPassword, isLoading, error, clearError } = useAuthStore();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  const handleSubmit = async () => {
    const errors: FormErrors = {
      password: ValidationRules.password(password),
      passwordConfirm: ValidationRules.passwordConfirm(
        passwordConfirm,
        password,
      ),
    };
    setFormErrors(errors);

    if (hasErrors(errors)) {
      return;
    }

    if (!token) {
      setFormErrors({ token: "Lien de réinitialisation invalide" });
      return;
    }

    clearError();
    setSuccessMessage(null);

    try {
      await resetPassword(token, password);
      setSuccessMessage("Mot de passe modifié. Tu peux te reconnecter.");
      setPassword("");
      setPasswordConfirm("");
    } catch {}
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 75,
      }}
    >
      <View
        className="w-full flex-col items-center gap-8 rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
        style={{ maxWidth: 460 }}
      >
        <View className="flex-col items-center gap-4">
          <AriusLogo
            size={54}
            onPress={
              Platform.OS === "web" ? () => router.push("/") : undefined
            }
          />
          <Text className="text-center text-4xl font-bold">
            Nouveau mot de passe
          </Text>
          <Text className="text-center text-gray text-lg">
            Choisis un nouveau mot de passe.
          </Text>
        </View>

        {(error || formErrors.token) && (
          <View
            className="w-full flex-row items-center gap-2 rounded-lg border p-3"
            style={{ backgroundColor: "#fef2f2", borderColor: "#fecaca" }}
          >
            <Ionicons name="alert-circle-outline" size={20} color="#b91c1c" />
            <Text className="flex-1 font-semibold" style={{ color: "#b91c1c" }}>
              {formErrors.token || error}
            </Text>
          </View>
        )}

        {successMessage && (
          <View
            className="w-full flex-row items-center gap-2 rounded-lg border p-3"
            style={{ backgroundColor: "#ecfdf3", borderColor: "#abefc6" }}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#067647" />
            <Text className="flex-1 font-semibold" style={{ color: "#067647" }}>
              {successMessage}
            </Text>
          </View>
        )}

        <FormInput
          label="Nouveau mot de passe"
          placeholder="Nouveau mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          enableVisibilityToggle
          error={formErrors.password}
        />

        <FormInput
          label="Confirmer le mot de passe"
          placeholder="Confirmer le mot de passe"
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          secureTextEntry
          enableVisibilityToggle
          error={formErrors.passwordConfirm}
        />

        <AppButton
          title={successMessage ? "Retour à la connexion" : "Modifier le mot de passe"}
          onPress={
            successMessage ? () => router.replace("/login") : handleSubmit
          }
          isLoading={isLoading}
        />
      </View>
    </ScrollView>
  );
}
