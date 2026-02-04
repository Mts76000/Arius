import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Colors } from "@/constants/theme";
import { FormInput } from "@/components/FormInput";
import { updateProfil, changerMotdepasse } from "@/services/profil";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/services/api";

interface ProfilData {
  id: string;
  email: string;
  prenom: string | null;
  nom: string | null;
}

export default function ProfilModal() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);

  // États formulaire infos perso
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");

  // États formulaire changement mot de passe
  const [ancienMotdepasse, setAncienMotdepasse] = useState("");
  const [nouveauMotdepasse, setNouveauMotdepasse] = useState("");
  const [confirmation, setConfirmation] = useState("");

  // Erreurs
  const [errorsProfil, setErrorsProfil] = useState<{
    [key: string]: string;
  }>({});
  const [errorsPassword, setErrorsPassword] = useState<{
    [key: string]: string;
  }>({});
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success";
    text: string;
  } | null>(null);

  const {
    data: profilData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["profil"],
    queryFn: async () => {
      const response = await api.get("/v1/auth/me");
      return response.data as ProfilData;
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateProfil,
    onSuccess: (data) => {
      Alert.alert("Succès", "Profil mis à jour avec succès");
      setEditMode(false);
      refetch();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error ||
        "Erreur lors de la mise à jour du profil";
      Alert.alert("Erreur", message);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: changerMotdepasse,
    onSuccess: () => {
      setPasswordMessage({
        type: "success",
        text: "Mot de passe changé avec succès",
      });
      setPasswordMode(false);
      resetPasswordFields();
    },
    onError: (error: any) => {
      const apiError = error?.response?.data?.error;
      let message = "Erreur lors du changement du mot de passe";

      if (apiError === "invalid old password") {
        message = "L'ancien mot de passe est incorrect";
        setErrorsPassword({ ancienMotdepasse: message });
      } else if (apiError === "passwords do not match") {
        message = "Les mots de passe ne correspondent pas";
        setErrorsPassword({ confirmation: message });
      } else if (apiError === "password must be at least 6 characters") {
        message = "Le mot de passe doit avoir au moins 6 caractères";
        setErrorsPassword({ nouveauMotdepasse: message });
      }
      if (
        apiError !== "invalid old password" &&
        apiError !== "passwords do not match" &&
        apiError !== "password must be at least 6 characters"
      ) {
        setErrorsPassword({
          confirmation: message,
        });
      }
    },
  });

  useEffect(() => {
    if (profilData) {
      setPrenom(profilData.prenom || "");
      setNom(profilData.nom || "");
    }
  }, [profilData]);

  const validateProfil = () => {
    const errors: { [key: string]: string } = {};

    if (!prenom.trim()) {
      errors.prenom = "Le prénom est requis";
    } else if (prenom.length < 2 || prenom.length > 50) {
      errors.prenom = "Le prénom doit avoir entre 2 et 50 caractères";
    }

    if (!nom.trim()) {
      errors.nom = "Le nom est requis";
    } else if (nom.length < 2 || nom.length > 50) {
      errors.nom = "Le nom doit avoir entre 2 et 50 caractères";
    }

    setErrorsProfil(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = () => {
    const errors: { [key: string]: string } = {};
    setPasswordMessage(null);

    if (!ancienMotdepasse) {
      errors.ancienMotdepasse = "L'ancien mot de passe est requis";
    }
    if (!nouveauMotdepasse) {
      errors.nouveauMotdepasse = "Le nouveau mot de passe est requis";
    } else if (nouveauMotdepasse.length < 6) {
      errors.nouveauMotdepasse =
        "Le mot de passe doit avoir au moins 6 caractères";
    }

    if (!confirmation) {
      errors.confirmation = "La confirmation est requise";
    } else if (nouveauMotdepasse !== confirmation) {
      errors.confirmation = "Les mots de passe ne correspondent pas";
    }

    setErrorsPassword(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateProfil = () => {
    if (!validateProfil()) return;
    updateMutation.mutate({ prenom, nom });
  };

  const handleChangePassword = () => {
    if (!validatePassword()) return;
    passwordMutation.mutate({
      ancienMotdepasse,
      nouveauMotdepasse,
      confirmation,
    });
  };

  const resetPasswordFields = () => {
    setAncienMotdepasse("");
    setNouveauMotdepasse("");
    setConfirmation("");
    setErrorsPassword({});
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const handleExportData = () => {
    Alert.alert(
      "Export de données",
      "Redirigez-vous vers la section export dans les paramètres (Epic 10)",
    );
    // TODO: Router vers la page d'export (Epic 10)
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Erreur lors du chargement du profil
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            onRefresh={() => refetch()}
            refreshing={isRefetching}
          />
        }
      >
        {/* Header Profil */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>
              {profilData?.prenom?.charAt(0) || "M"}
              {profilData?.nom?.charAt(0) || "L"}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profilData?.prenom || "Utilisateur"} {profilData?.nom || ""}
            </Text>
            <Text style={styles.profileEmail}>{profilData?.email}</Text>
          </View>
        </View>

        {/* Informations Personnelles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Informations Personnelles</Text>
            {!editMode && (
              <TouchableOpacity onPress={() => setEditMode(true)}>
                <Text style={styles.editLink}>Modifier</Text>
              </TouchableOpacity>
            )}
          </View>

          {editMode ? (
            <View style={styles.formContainer}>
              <FormInput
                label="Prénom"
                value={prenom}
                onChangeText={setPrenom}
                placeholder="Votre prénom"
                error={errorsProfil.prenom}
              />

              <FormInput
                label="Nom"
                value={nom}
                onChangeText={setNom}
                placeholder="Votre nom"
                error={errorsProfil.nom}
                style={{ marginTop: 16 }}
              />

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setEditMode(false);
                    setPrenom(profilData?.prenom || "");
                    setNom(profilData?.nom || "");
                    setErrorsProfil({});
                  }}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={handleUpdateProfil}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Enregistrer</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{profilData?.email}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Prénom</Text>
                <Text style={styles.infoValue}>
                  {profilData?.prenom || "-"}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Nom</Text>
                <Text style={styles.infoValue}>{profilData?.nom || "-"}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Sécurité */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sécurité</Text>
            {!passwordMode && (
              <TouchableOpacity onPress={() => setPasswordMode(true)}>
                <Text style={styles.editLink}>Modifier</Text>
              </TouchableOpacity>
            )}
          </View>

          {passwordMessage && (
            <Text style={styles.successMessage}>{passwordMessage.text}</Text>
          )}

          {passwordMode ? (
            <View style={styles.formContainer}>
              <FormInput
                label="Ancien mot de passe"
                value={ancienMotdepasse}
                onChangeText={setAncienMotdepasse}
                placeholder="Votre mot de passe actuel"
                secureTextEntry
                enableVisibilityToggle
                error={errorsPassword.ancienMotdepasse}
              />

              <FormInput
                label="Nouveau mot de passe"
                value={nouveauMotdepasse}
                onChangeText={setNouveauMotdepasse}
                placeholder="Nouveau mot de passe"
                secureTextEntry
                enableVisibilityToggle
                error={errorsPassword.nouveauMotdepasse}
                style={{ marginTop: 16 }}
              />

              <FormInput
                label="Confirmer le nouveau mot de passe"
                value={confirmation}
                onChangeText={setConfirmation}
                placeholder="Confirmer le nouveau mot de passe"
                secureTextEntry
                enableVisibilityToggle
                error={errorsPassword.confirmation}
                style={{ marginTop: 16 }}
              />

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setPasswordMode(false);
                    resetPasswordFields();
                  }}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={handleChangePassword}
                  disabled={passwordMutation.isPending}
                >
                  {passwordMutation.isPending ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Enregistrer</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>Mot de passe sécurisé</Text>
            </View>
          )}
        </View>

        {/* Données */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Données</Text>
          <TouchableOpacity
            style={styles.dataButton}
            onPress={handleExportData}
          >
            <Text style={styles.dataButtonText}>
              Exporter mes données (RGPD)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Déconnexion */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  avatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.tint,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "white",
    fontWeight: "700",
    fontSize: 18,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.light.text,
  },
  editLink: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: "600",
  },
  infoContainer: {
    gap: 12,
  },
  infoItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    paddingBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.light.text,
    opacity: 0.6,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: "600",
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  formContainer: {
    gap: 8,
  },
  errorMessage: {
    fontSize: 12,
    color: "red",
    marginTop: -4,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 12,
    color: "green",
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: Colors.light.border,
  },
  cancelButtonText: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: Colors.light.tint,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  dataButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  dataButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#E5484D",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
