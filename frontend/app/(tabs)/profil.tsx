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
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";

import { FormInput } from "@/components/forms/FormInput";
import { updateProfil, changerMotdepasse } from "@/services/profil";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/services/api";
import { exportService } from "@/services/export";
import { AppButton } from "@/components/ui/AppButton";

interface ProfilData {
  id: string;
  email: string;
  prenom: string | null;
  nom: string | null;
}

export default function ProfilModal() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const token = useAuthStore((state) => state.token);
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

  // Export RGPD
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExportData = async (
    type?: "prospects" | "rdvs" | "notes" | "ca" | "objectifs" | any,
  ) => {
    if (!token) {
      Alert.alert("Erreur", "Vous devez être connecté");
      return;
    }

    try {
      setIsExporting(true);
      setExportError(null);
      if (Platform.OS !== "web") {
        setIsExporting(false);
        Alert.alert(
          "Info",
          "Téléchargement disponible sur la version web pour l’instant",
        );
        return;
      }

      const exportType:
        | "prospects"
        | "rdvs"
        | "notes"
        | "ca"
        | "objectifs"
        | undefined =
        typeof type === "string"
          ? (type as "prospects" | "rdvs" | "notes" | "ca" | "objectifs")
          : undefined;
      const { data, filename, contentType } = await exportService.download(
        token,
        exportType,
      );

      const blob =
        data instanceof Blob ? data : new Blob([data], { type: contentType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setIsExporting(false);
    } catch (error: any) {
      const message =
        error?.response?.data?.error || "Impossible de lancer l'export";
      setIsExporting(false);
      setExportError(message);
      Alert.alert("Erreur", message);
    }
  };

  if (isLoading) {
    return (
      <View>
        <ActivityIndicator size="large" color={"#0ea5e9"} />
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <Text>
          Erreur lors du chargement du profil
        </Text>
        <AppButton
          title="Reessayer"
          onPress={() => refetch()}
         
        />
      </View>
    );
  }

  return (
    <View>
      <ScrollView
        refreshControl={
          <RefreshControl
            onRefresh={() => refetch()}
            refreshing={isRefetching}
          />
        }
      >
        {/* Header Profil */}
        <View>
          <View>
            <Text>
              {profilData?.prenom?.charAt(0) || "M"}
              {profilData?.nom?.charAt(0) || "L"}
            </Text>
          </View>
          <View>
            <Text>
              {profilData?.prenom || "Utilisateur"} {profilData?.nom || ""}
            </Text>
            <Text>{profilData?.email}</Text>
          </View>
        </View>

        {/* Informations Personnelles */}
        <View>
          <View>
            <Text>Informations Personnelles</Text>
            {!editMode && (
              <AppButton
                title="Modifier"
                onPress={() => setEditMode(true)}
                variant="link"
               
              />
            )}
          </View>

          {editMode ? (
            <View>
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
              />

              <View>
                <AppButton
                  title="Annuler"
                  onPress={() => {
                    setEditMode(false);
                    setPrenom(profilData?.prenom || "");
                    setNom(profilData?.nom || "");
                    setErrorsProfil({});
                  }}
                  variant="secondary"
                />
                <AppButton
                  title="Enregistrer"
                  onPress={handleUpdateProfil}
                  isLoading={updateMutation.isPending}
                />
              </View>
            </View>
          ) : (
            <View>
              <View>
                <Text>Email</Text>
                <Text>{profilData?.email}</Text>
              </View>
              <View>
                <Text>Prénom</Text>
                <Text>
                  {profilData?.prenom || "-"}
                </Text>
              </View>
              <View>
                <Text>Nom</Text>
                <Text>{profilData?.nom || "-"}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Sécurité */}
        <View>
          <View>
            <Text>Sécurité</Text>
            {!passwordMode && (
              <AppButton
                title="Modifier"
                onPress={() => setPasswordMode(true)}
                variant="link"
               
              />
            )}
          </View>

          {passwordMessage && (
            <Text>{passwordMessage.text}</Text>
          )}

          {passwordMode ? (
            <View>
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
              />

              <FormInput
                label="Confirmer le nouveau mot de passe"
                value={confirmation}
                onChangeText={setConfirmation}
                placeholder="Confirmer le nouveau mot de passe"
                secureTextEntry
                enableVisibilityToggle
                error={errorsPassword.confirmation}
              />

              <View>
                <AppButton
                  title="Annuler"
                  onPress={() => {
                    setPasswordMode(false);
                    resetPasswordFields();
                  }}
                  variant="secondary"
                />
                <AppButton
                  title="Enregistrer"
                  onPress={handleChangePassword}
                  isLoading={passwordMutation.isPending}
                />
              </View>
            </View>
          ) : (
            <View>
              <Text>Mot de passe sécurisé</Text>
            </View>
          )}
        </View>

        {/* Export de données */}
        <View>
          <View>
            <View>
              <Text>⬇️</Text>
            </View>
            <View>
              <Text>Export de données</Text>
              <Text>
                Sauvegardez ou utilisez vos données dans d'autres outils
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleExportData}
            disabled={isExporting}
          >
            <View>
              <View>
                <Text>📄</Text>
              </View>
              <View>
                <Text>Export complet</Text>
                <Text>
                  Tout en un fichier ZIP
                </Text>
              </View>
            </View>
            <Text>⬇️</Text>
          </TouchableOpacity>

          <View>
            <View />
            <Text>OU PAR CATÉGORIE</Text>
            <View />
          </View>

          <View>
            {[
              { label: "Prospects", icon: "🏢", type: "prospects" },
              { label: "Rendez-vous", icon: "📅", type: "rdvs" },
              { label: "Notes", icon: "📝", type: "notes" },
              { label: "Chiffre d'affaires", icon: "📊", type: "ca" },
              { label: "Objectifs", icon: "🎯", type: "objectifs" },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => handleExportData(item.type as any)}
              >
                <View>
                  <View>
                    <Text>{item.icon}</Text>
                  </View>
                  <Text>{item.label}</Text>
                </View>
                <Text>⬇️</Text>
              </TouchableOpacity>
            ))}
          </View>

          {!!exportError && (
            <Text>{exportError}</Text>
          )}

          <View>
            <Text>
              Vos données vous appartiennent. Exportez-les à tout moment en
              toute liberté.
            </Text>
          </View>
        </View>

        {/* Déconnexion */}
        <View>
          <AppButton
            title="Deconnexion"
            onPress={handleLogout}
            variant="danger"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
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
    backgroundColor: "#0ea5e9",
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
    color: "#0f172a",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 13,
    color: "#64748b",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#0f172a",
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
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
    color: "#0f172a",
  },
  infoContainer: {
    gap: 12,
  },
  infoItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: "#0f172a",
    opacity: 0.6,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#0f172a",
    fontWeight: "600",
  },
  infoText: {
    fontSize: 14,
    color: "#0f172a",
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
  },
  exportSection: {
    marginBottom: 24,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  exportHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  exportHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  exportHeaderIconText: {
    fontSize: 18,
  },
  exportHeaderText: {
    flex: 1,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  exportSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  exportPrimaryCard: {
    backgroundColor: "#2F6FED",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  exportPrimaryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  exportPrimaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  exportPrimaryIconText: {
    fontSize: 18,
  },
  exportPrimaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
  },
  exportPrimarySubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },
  exportPrimaryAction: {
    fontSize: 18,
    color: "white",
  },
  exportDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  exportDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  exportDividerText: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
  },
  exportList: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "white",
  },
  exportListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  exportListLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  exportListIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#F3F6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  exportListIconText: {
    fontSize: 14,
  },
  exportListLabel: {
    fontSize: 13,
    color: "#0f172a",
    fontWeight: "600",
  },
  exportListAction: {
    fontSize: 16,
    color: "#94a3b8",
  },
  exportInfoBox: {
    marginTop: 14,
    backgroundColor: "#EEF4FF",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D6E4FF",
  },
  exportInfoText: {
    fontSize: 12,
    color: "#3764D8",
  },
  exportErrorText: {
    fontSize: 12,
    color: "#ef4444",
  },
  logoutButton: {
    alignSelf: "stretch",
  },
});
