import React, { useState, useEffect } from "react";
import {
  View,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { FormInput } from "@/components/forms/FormInput";
import { ValidationRules, hasErrors, FormErrors } from "@/utils/validation";
import { AppButton } from "@/components/ui/AppButton";

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
  }, [user]);

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
    } catch (err) {
      Alert.alert("Erreur", error || "Une erreur est survenue");
    }
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {isRegisterMode ? "Créer un compte" : "Connexion"}
          </Text>
          <Text style={styles.subtitle}>
            Accédez à votre espace en quelques secondes.
          </Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <FormInput
            label="Email"
            placeholder="Email"
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
            style={styles.primaryButton}
          />

          <AppButton
            title={
              isRegisterMode
                ? "Déjà un compte ? Se connecter"
                : "Pas de compte ? S'inscrire"
            }
            onPress={toggleMode}
            variant="link"
            style={styles.switchButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
  },
  card: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    boxShadow: "0 6px 10px rgba(30, 41, 59, 0.12)",
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: "#fef2f2",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f87171",
  },
  errorText: {
    color: "#b91c1c",
  },
  primaryButton: {
    marginBottom: 16,
    marginTop: 8,
  },
  switchButton: {
    marginTop: 8,
  },
});
