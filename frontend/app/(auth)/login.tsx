import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { FormInput } from "@/components/forms/FormInput";
import { ValidationRules, hasErrors, FormErrors } from "@/utils/validation";
import { AppButton } from "@/components/ui/AppButton";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const router = useRouter();
  const { login, register, isLoading, error, user, clearError } =
    useAuthStore();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (user) {
      router.replace("/(tabs)");
    }
  }, [router, user]);

  useEffect(() => {
    if (!error) {
      return;
    }

    const timeoutId = setTimeout(() => {
      clearError();
    }, 10000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [error, clearError]);

  const validateFormFields = (): boolean => {
    const errors: FormErrors = {};

    if (isRegisterMode) {
      errors.email = ValidationRules.email(email);
      errors.password = ValidationRules.password(password);
      errors.passwordConfirm = ValidationRules.passwordConfirm(
        passwordConfirm,
        password,
      );
      errors.prenom = ValidationRules.text(prenom, 1);
      errors.nom = ValidationRules.text(nom, 1);
    } else {
      errors.email = ValidationRules.email(email);
      errors.password = ValidationRules.password(password);
    }

    setFormErrors(errors);
    return !hasErrors(errors);
  };

  const handleSubmit = async () => {
    if (!validateFormFields()) {
      return;
    }

    clearError();
    try {
      if (isRegisterMode) {
        await register(email, password, prenom, nom);
      } else {
        await login(email, password);
      }
    } catch {}
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setFormErrors({});
    if (isRegisterMode) {
      setPasswordConfirm("");
      setPrenom("");
      setNom("");
    }
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
      <View className="w-full max-w-md flex-col items-center gap-8 bg-white p-12 rounded-[20px] shadow-sm">
        <View className="flex-col items-center gap-4">
          <View className="bg-primary w-[50px] h-[50px] rounded-xl items-center justify-center">
            <Ionicons name="cube-outline" size={30} color="white" />
          </View>
          <Text className="text-4xl font-bold">Arius CRM</Text>
          <Text className="text-gray text-lg">
            {isRegisterMode ? "Créer un compte" : "Connexion à votre compte"}
          </Text>
        </View>
        {error && (
          <View className="flex items-center w-full p-2 bg-red-100 rounded-xl border border-red-300">
            <Text className="text-red-500">{error}</Text>
          </View>
        )}
        <FormInput
          label="Email"
          placeholder="email@exemple.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          error={formErrors.email}
        />
        <FormInput
          label="Mot de passe"
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          enableVisibilityToggle
          error={formErrors.password}
        />
        {isRegisterMode && (
          <>
            <FormInput
              label="Confirmer le mot de passe"
              placeholder="Confirmer le mot de passe"
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              secureTextEntry
              enableVisibilityToggle
              error={formErrors.passwordConfirm}
            />

            <FormInput
              label="Prénom"
              placeholder="Prénom"
              value={prenom}
              onChangeText={setPrenom}
              error={formErrors.prenom}
            />

            <FormInput
              label="Nom"
              placeholder="Nom"
              value={nom}
              onChangeText={setNom}
              error={formErrors.nom}
            />
          </>
        )}
        <AppButton
          title={isRegisterMode ? "S'inscrire" : "Se connecter"}
          onPress={handleSubmit}
          isLoading={isLoading}
        />
        <Pressable onPress={toggleMode} accessibilityRole="button">
          <Text className="text-primary font-medium">
            {isRegisterMode
              ? "Déjà un compte ? Se connecter"
              : "Pas de compte ? S'inscrire"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
