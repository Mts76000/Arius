import React from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import {
  useCreateEntreprise,
  useUpdateEntreprise,
} from "@/hooks/useEntreprises";
import {
  EntrepriseForm,
  PendingEntrepriseLogo,
} from "@/components/forms/EntrepriseForm";
import {
  entreprisesService,
  type CreateEntrepriseInput,
} from "@/services/entreprises";
import { useAuthStore } from "@/store/authStore";

export default function CreateEntrepriseScreen() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const createMutation = useCreateEntreprise();
  const updateMutation = useUpdateEntreprise();

  const handleSubmit = async (
    data: CreateEntrepriseInput,
    pendingLogo?: PendingEntrepriseLogo,
  ) => {
    try {
      const entreprise = await createMutation.mutateAsync(data);
      if (pendingLogo && token) {
        try {
          const logoUrl = await entreprisesService.uploadLogo(
            token,
            entreprise.id,
            pendingLogo,
          );
          await updateMutation.mutateAsync({
            id: entreprise.id,
            data: { logo: logoUrl },
          });
        } catch {
          Alert.alert(
            "Entreprise créée",
            "L'entreprise a bien été créée, mais le logo n'a pas pu être ajouté.",
          );
        }
      }
      router.replace(`/(tabs)/entreprises/${entreprise.id}`);
    } catch {
      Alert.alert("Erreur", "Impossible de créer l'entreprise");
    }
  };

  return (
    <EntrepriseForm
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      isLoading={createMutation.isPending || updateMutation.isPending}
      submitLabel="Créer l'entreprise"
    />
  );
}
