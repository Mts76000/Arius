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
  const { login, register, forgotPassword, isLoading, error, user, clearError } =
    useAuthStore();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

    if (isForgotMode) {
      errors.email = ValidationRules.email(email);
    } else if (isRegisterMode) {
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
    setSuccessMessage(null);
    try {
      if (isForgotMode) {
        await forgotPassword(email);
        setSuccessMessage(
          "Si un compte existe avec cet email, un lien vient d'être envoyé.",
        );
      } else if (isRegisterMode) {
        await register(email, password, prenom, nom);
      } else {
        await login(email, password);
      }
    } catch {}
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setIsForgotMode(false);
    setFormErrors({});
    setSuccessMessage(null);
    if (isRegisterMode) {
      setPasswordConfirm("");
      setPrenom("");
      setNom("");
    }
  };

  const showForgotMode = () => {
    setIsForgotMode(true);
    setIsRegisterMode(false);
    setFormErrors({});
    setSuccessMessage(null);
    clearError();
  };

  const showLoginMode = () => {
    setIsForgotMode(false);
    setIsRegisterMode(false);
    setFormErrors({});
    setSuccessMessage(null);
    clearError();
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
          <View className="bg-primary w-[50px] h-[50px] rounded-xl items-center justify-center">
            <Ionicons name="cube-outline" size={30} color="white" />
          </View>
          <Text className="text-4xl font-bold">Arius CRM</Text>
          <Text className="text-gray text-lg">
            {isForgotMode
              ? "Recevoir un lien de réinitialisation"
              : isRegisterMode
                ? "Créer un compte"
                : "Connexion à votre compte"}
          </Text>
        </View>
        {error && (
          <View
            className="w-full flex-row items-start gap-2 rounded-lg border p-3"
            style={{ backgroundColor: "#fef2f2", borderColor: "#fecaca" }}
          >
            <Ionicons name="alert-circle-outline" size={20} color="#b91c1c" />
            <Text className="flex-1 font-semibold" style={{ color: "#b91c1c" }}>
              {error}
            </Text>
          </View>
        )}
        {successMessage && (
          <View
            className="w-full flex-row items-start gap-2 rounded-lg border p-3"
            style={{ backgroundColor: "#ecfdf3", borderColor: "#abefc6" }}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#067647" />
            <Text className="flex-1 font-semibold" style={{ color: "#067647" }}>
              {successMessage}
            </Text>
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
        {!isForgotMode && (
          <>
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
          </>
        )}
        <AppButton
          title={
            isForgotMode
              ? "Envoyer le lien"
              : isRegisterMode
                ? "S'inscrire"
                : "Se connecter"
          }
          onPress={handleSubmit}
          isLoading={isLoading}
        />
        <View className="items-center gap-3">
          {!isRegisterMode && !isForgotMode && (
            <Pressable onPress={showForgotMode} accessibilityRole="button">
              <Text className="text-primary font-medium">
                Mot de passe oublié ?
              </Text>
            </Pressable>
          )}
          {isForgotMode ? (
            <Pressable onPress={showLoginMode} accessibilityRole="button">
              <Text className="text-primary font-medium">
                Retour à la connexion
              </Text>
            </Pressable>
          ) : (
            <Pressable onPress={toggleMode} accessibilityRole="button">
              <Text className="text-primary font-medium">
                {isRegisterMode
                  ? "Déjà un compte ? Se connecter"
                  : "Pas de compte ? S'inscrire"}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
