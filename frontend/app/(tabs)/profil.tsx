import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Platform,
  Modal,
  useWindowDimensions,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { FormInput } from "@/components/forms/FormInput";
import {
  anonymiserCompte,
  changerMotdepasse,
  updateProfil,
} from "@/services/profil";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/services/api";
import { exportService } from "@/services/export";
import { AppButton } from "@/components/ui/AppButton";
import { AppSpinner } from "@/components/ui/AppSpinner";
import { Ionicons } from "@expo/vector-icons";

interface ProfilData {
  id: string;
  email: string;
  prenom: string | null;
  nom: string | null;
}

type ExportType = "prospects" | "rdvs" | "notes" | "ca" | "objectifs";

export default function ProfilModal() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { width } = useWindowDimensions();
  const logout = useAuthStore((state) => state.logout);
  const token = useAuthStore((state) => state.token);
  const isDesktop = width >= 700;
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
  const [isAnonymizing, setIsAnonymizing] = useState(false);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] =
    useState(false);
  const [deleteAccountPassword, setDeleteAccountPassword] = useState("");
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(
    null,
  );

  const exportItems: {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    type: ExportType;
    iconColor: string;
    iconBackgroundClass: string;
  }[] = [
    {
      label: "Prospects",
      icon: "people-outline",
      type: "prospects",
      iconColor: "#007aff",
      iconBackgroundClass: "bg-primaryLight",
    },
    {
      label: "Rendez-vous",
      icon: "calendar-outline",
      type: "rdvs",
      iconColor: "#A855F7",
      iconBackgroundClass: "bg-purpleLight",
    },
    {
      label: "Notes",
      icon: "document-outline",
      type: "notes",
      iconColor: "#FF9502",
      iconBackgroundClass: "bg-orangeLight",
    },
    {
      label: "Chiffre d'affaires",
      icon: "bar-chart-outline",
      type: "ca",
      iconColor: "#34C759",
      iconBackgroundClass: "bg-greenMedium",
    },
    {
      label: "Objectifs",
      icon: "checkmark-circle-outline",
      type: "objectifs",
      iconColor: "#EF4444",
      iconBackgroundClass: "bg-redLight",
    },
  ];

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
    onSuccess: async () => {
      queryClient.setQueryData(["profil"], (oldData: ProfilData | undefined) =>
        oldData ? { ...oldData, prenom, nom } : oldData,
      );

      useAuthStore.setState((state) => ({
        user: state.user ? { ...state.user, prenom, nom } : state.user,
      }));

      queryClient.setQueriesData(
        { queryKey: ["user"] },
        (oldData: ProfilData | undefined) =>
          oldData ? { ...oldData, prenom, nom } : oldData,
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["profil"] }),
        queryClient.invalidateQueries({ queryKey: ["user"] }),
      ]);

      Alert.alert("Succès", "Profil mis à jour avec succès");
      setEditMode(false);
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

  const deleteAccountAndLogout = async (motdepasse: string) => {
    try {
      setIsAnonymizing(true);
      await anonymiserCompte({ motdepasse });
      logout();
      Alert.alert(
        "Compte supprimé",
        "Vos données ont été supprimées et votre compte a été anonymisé.",
      );
      router.replace("/login");
    } catch (error: any) {
      const apiError = error?.response?.data?.error;
      const message =
        apiError === "invalid password"
          ? "Mot de passe incorrect"
          : apiError === "password required"
            ? "Le mot de passe est requis"
          : apiError === "password unavailable"
            ? "Ce compte ne peut pas être supprimé avec un mot de passe local."
            : "Impossible de supprimer le compte pour le moment";
      setDeleteAccountError(message);
    } finally {
      setIsAnonymizing(false);
    }
  };

  const handleDeleteAccount = () => {
    setDeleteAccountPassword("");
    setDeleteAccountError(null);
    setDeleteAccountModalVisible(true);
  };

  const confirmDeleteAccount = () => {
    if (!deleteAccountPassword.trim()) {
      setDeleteAccountError("Le mot de passe est requis");
      return;
    }
    setDeleteAccountError(null);
    deleteAccountAndLogout(deleteAccountPassword);
  };

  const handleExportData = async (type?: ExportType) => {
    if (!token) {
      Alert.alert("Erreur", "Vous devez être connecté");
      return;
    }

    try {
      setIsExporting(true);
      setExportError(null);
      const { url } = await exportService.createMobileDownloadLink(token, type);

      if (Platform.OS === "web") {
        window.location.assign(url);
      } else {
        await Linking.openURL(url);
      }

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
      <AppSpinner size="large" centered />
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text>Erreur lors du chargement du profil</Text>
        <AppButton title="Réessayer" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <View className="flex-1 pt-8">
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          alignSelf: "center",
          maxWidth: 920,
          paddingBottom: isDesktop ? 56 : 190,
          paddingHorizontal: isDesktop ? 32 : 20,
          width: "100%",
        }}
        refreshControl={
          <RefreshControl
            onRefresh={() => refetch()}
            refreshing={isRefetching}
          />
        }
      >
        <View className="flex-col gap-6 mt-4">
          <View className="flex-row bg-white rounded-3xl p-6 gap-6 shadow-base">
            <View className="h-[60px] w-[60px] items-center justify-center rounded-xl bg-primary">
              <Text className="text-xl font-semibold text-white uppercase">
                {profilData?.prenom?.charAt(0)}
                {profilData?.nom?.charAt(0)}
              </Text>
            </View>
            <View className="min-w-0 flex-1 flex-col gap-2">
              <Text
                className="text-lg font-semibold capitalize text-slate-900"
                numberOfLines={1}
              >
                {profilData?.prenom || "Utilisateur"} {profilData?.nom || ""}
              </Text>
              <Text className="text-sm text-gray" numberOfLines={1}>
                {profilData?.email}
              </Text>
            </View>
          </View>

          {/* Informations Personnelles */}
          <View className="flex-col bg-white rounded-3xl p-6 gap-6 shadow-base">
            <View className="flex-row items-start">
              <View className="min-w-0 flex-1 flex-row gap-4 items-start">
                <Ionicons
                  className="bg-[#E6F9EE] p-2 rounded-2xl"
                  name="document-text-outline"
                  size={25}
                  color="#34C759"
                />
                <View className="flex-1">
                  <Text
                    className="text-lg font-semibold text-slate-900"
                    numberOfLines={2}
                  >
                    Informations personnelles
                  </Text>
                  <Text className="text-gray text-sm">
                    {"Gérez vos informations de profil visibles dans l'application"}
                  </Text>
                </View>
              </View>
            </View>

            {editMode ? (
              <View className="bg-[#F8FAFF] border border-[#E2E8F0] rounded-2xl p-4 flex-col gap-4">
                <Text className="text-gray mb-3">
                  Mettez à jour vos informations et enregistrez les changements.
                </Text>

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

                <View className="flex-row gap-3 mt-4">
                  <View className="flex-1">
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
                  </View>
                  <View className="flex-1">
                    <AppButton
                      title="Enregistrer"
                      onPress={handleUpdateProfil}
                      isLoading={updateMutation.isPending}
                    />
                  </View>
                </View>
              </View>
            ) : (
              <View className="flex-col gap-3">
                <View className="rounded-2xl border border-grayLight bg-[#F8FAFC] p-4 flex-row items-center justify-between">
                  <View className="flex-col gap-1">
                    <Text className="text-gray">Prénom</Text>
                    <Text className="text-base font-medium text-slate-900">
                      {profilData?.prenom || "-"}
                    </Text>
                  </View>
                </View>

                <View className="rounded-2xl border border-grayLight bg-[#F8FAFC] p-4 flex-row items-center justify-between">
                  <View className="flex-col gap-1">
                    <Text className="text-gray">Nom</Text>
                    <Text className="text-base font-medium text-slate-900">
                      {profilData?.nom || "-"}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {!editMode && (
              <AppButton
                title="Modifier"
                onPress={() => setEditMode(true)}
                variant="secondary"
                icon={
                  <Ionicons name="create-outline" size={15} color="#334155" />
                }
                className="rounded-xl border border-grayLight bg-[#F8FAFC]"
              />
            )}
          </View>

          {/* Sécurité */}
          <View className="flex-col  bg-white  rounded-3xl p-6 gap-6   shadow-base">
            <View className="flex-row gap-4 items-start">
              <Ionicons
                className="bg-red/20 p-2 rounded-2xl"
                name="lock-closed-outline"
                size={25}
                color="#fb2c36"
              />

              <View className="flex-col gap-2 flex-1">
                <Text className="text-lg font-semibold text-slate-900">Sécurité</Text>

                <Text className="text-gray">
                  Gérer votre mot de passe et la sécurité du compte
                </Text>
              </View>
            </View>

            {passwordMode ? (
              <View className="bg-[#FFF8F8] border border-[#FAD4D7] rounded-2xl p-4 flex-col gap-4">
                <Text className="text-gray">
                  Modifiez votre mot de passe pour garder votre compte sécurisé.
                </Text>

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

                <View className="flex-row gap-3 mt-2">
                  <View className="flex-1">
                    <AppButton
                      title="Annuler"
                      onPress={() => {
                        setPasswordMode(false);
                        resetPasswordFields();
                      }}
                      variant="secondary"
                    />
                  </View>
                  <View className="flex-1">
                    <AppButton
                      title="Enregistrer"
                      onPress={handleChangePassword}
                      isLoading={passwordMutation.isPending}
                    />
                  </View>
                </View>
              </View>
            ) : (
              <View className="flex-col gap-3">
                <View className="flex-row items-center gap-2">
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={18}
                    color="#16a34a"
                  />
                  <Text className="text-gray">Mot de passe sécurisé</Text>
                </View>

                <AppButton
                  title="Modifier"
                  onPress={() => setPasswordMode(true)}
                  variant="secondary"
                  icon={
                    <Ionicons name="create-outline" size={15} color="#334155" />
                  }
                  className="rounded-xl border border-grayLight bg-[#F8FAFC]"
                />
                <AppButton
                  title={isAnonymizing ? "Suppression..." : "Supprimer le compte"}
                  onPress={handleDeleteAccount}
                  variant="secondary"
                  isLoading={isAnonymizing}
                  className="rounded-xl border border-grayLight bg-[#F8FAFC]"
                />
              </View>
            )}

            {passwordMessage && (
              <View className="rounded-xl bg-[#ECFDF3] border border-[#ABEFC6] px-3 py-2">
                <Text className="text-[#067647]">{passwordMessage.text}</Text>
              </View>
            )}
          </View>

          {/* Confidentialité et données */}
          <View className="flex-col  bg-white  rounded-3xl p-6 gap-6   shadow-base">
            <View className="flex-row gap-4 items-start ">
              <Ionicons
                className="bg-[#E8F1FF] p-2 rounded-2xl"
                name="shield-checkmark-outline"
                size={25}
                color="#246BFD"
              />

              <View className="flex-col gap-2 flex-1">
                <Text className="text-lg font-semibold text-slate-900">
                  Confidentialité & données
                </Text>

                <Text className="text-gray">
                  Vos informations restent liées à votre compte et peuvent être
                  exportées ou supprimées à tout moment.
                </Text>
              </View>
            </View>

            <View className="gap-3">
              {[
                {
                  title: "Données privées",
                  text: "Chaque utilisateur ne voit que ses propres entreprises, rendez-vous et notes.",
                },
                {
                  title: "Export disponible",
                  text: "Vous pouvez récupérer vos données en ZIP ou par catégorie.",
                },
                {
                  title: "Suppression maîtrisée",
                  text: "La suppression efface les données du compte puis anonymise l’utilisateur.",
                },
              ].map((item) => (
                <View
                  key={item.title}
                  className="rounded-2xl border border-grayLight bg-[#F8FAFC] p-4"
                >
                  <Text className="font-semibold text-slate-900">
                    {item.title}
                  </Text>
                  <Text className="mt-1 text-sm text-gray">{item.text}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => handleExportData()}
              disabled={isExporting}
              activeOpacity={0.8}
              className="bg-primary rounded-2xl px-4 py-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <Ionicons name="archive-outline" size={20} color="white" />
                </View>
                <View className="flex-1 pr-2">
                <Text className="text-base font-semibold text-white">
                    Export complet
                  </Text>
                  <Text className="text-white/80 text-sm">
                    Toutes les données en fichier ZIP
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <View className="flex-row items-center gap-3">
              <View className="h-[1px] flex-1 bg-grayLight" />
              <Text className="text-xs font-semibold text-gray tracking-widest">
                PAR CATÉGORIE
              </Text>
              <View className="h-[1px] flex-1 bg-grayLight" />
            </View>

            <View className="border border-grayLight rounded-2xl overflow-hidden">
              {exportItems.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={() => handleExportData(item.type)}
                  className={`px-4 py-4 flex-row items-center justify-between ${
                    index !== exportItems.length - 1
                      ? "border-b border-grayLight"
                      : ""
                  }`}
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      className={`h-10 w-10 items-center justify-center rounded-xl ${item.iconBackgroundClass}`}
                    >
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={item.iconColor}
                      />
                    </View>
                    <Text className="text-base font-medium text-slate-900">
                      {item.label}
                    </Text>
                  </View>
                  <Ionicons name="download-outline" size={18} color="#94A3B8" />
                </TouchableOpacity>
              ))}
            </View>

            {!!exportError && (
              <View className="rounded-xl bg-[#FEF3F2] border border-[#FECDCA] px-3 py-2">
                <Text className="text-[#B42318]">{exportError}</Text>
              </View>
            )}

            <View className="bg-[#EEF4FF] border border-[#D6E4FF] rounded-2xl p-3">
              <Text className="text-[#2F6FED]">
                Vos données vous appartiennent. Exportez-les à tout moment en
                toute liberté.
              </Text>
            </View>

            <AppButton
              title="Politique de confidentialité"
              onPress={() => router.push("/(tabs)/privacy" as any)}
              variant="secondary"
              icon={
                <Ionicons name="document-text-outline" size={16} color="#334155" />
              }
              className="rounded-xl border border-grayLight bg-[#F8FAFC]"
            />
          </View>

          {/* Aide */}
          <View className="flex-col bg-white rounded-3xl p-6 gap-5 shadow-base">
            <View className="flex-row gap-4 items-start">
              <Ionicons
                className="bg-primaryLight p-2 rounded-2xl"
                name="help-circle-outline"
                size={25}
                color="#007aff"
              />
              <View className="flex-1 gap-2">
                <Text className="text-lg font-semibold text-slate-900">Aide</Text>
                <Text className="text-gray">
                  En cas de problème, contactez l’administrateur du projet avec
                  votre email de compte.
                </Text>
              </View>
            </View>

            <View className="rounded-2xl border border-grayLight bg-[#F8FAFC] p-4">
              <Text className="font-semibold text-slate-900">
                Parcours conseillé
              </Text>
              <Text className="mt-1 text-sm text-gray">
                Créez une entreprise, ajoutez un contact, planifiez un
                rendez-vous puis notez le compte-rendu.
              </Text>
            </View>
          </View>

          {/* Déconnexion */}
          <View className="pb-2">
            <AppButton
              title="Déconnexion"
              onPress={handleLogout}
              variant="danger"
              className="bg-red border border-red"
            />
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={deleteAccountModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteAccountModalVisible(false)}
      >
        <View className="flex-1 justify-center bg-black/40 px-5">
          <View className="rounded-3xl bg-white p-5 gap-4">
            <View className="gap-2">
              <Text className="text-lg font-semibold text-slate-900">
                Confirmer la suppression
              </Text>
              <Text className="text-gray">
                Cette action est irréversible. Entrez votre mot de passe pour
                supprimer vos données et anonymiser le compte.
              </Text>
            </View>

            <FormInput
              label="Mot de passe"
              value={deleteAccountPassword}
              onChangeText={setDeleteAccountPassword}
              placeholder="Votre mot de passe"
              secureTextEntry
              enableVisibilityToggle
              error={deleteAccountError}
            />

            <View className="gap-3">
              <AppButton
                title="Supprimer le compte"
                onPress={confirmDeleteAccount}
                variant="danger"
                isLoading={isAnonymizing}
                className="bg-red border border-red"
              />
              <AppButton
                title="Annuler"
                onPress={() => {
                  setDeleteAccountModalVisible(false);
                  setDeleteAccountPassword("");
                  setDeleteAccountError(null);
                }}
                variant="secondary"
                disabled={isAnonymizing}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
