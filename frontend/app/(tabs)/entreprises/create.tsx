import React from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useCreateEntreprise } from "@/hooks/useEntreprises";
import { EntrepriseForm } from "@/components/EntrepriseForm";
import type { CreateEntrepriseInput } from "@/services/entreprises";

export default function CreateEntrepriseScreen() {
  const router = useRouter();
  const createMutation = useCreateEntreprise();

  const handleSubmit = async (data: CreateEntrepriseInput) => {
    try {
      const entreprise = await createMutation.mutateAsync(data);
      router.replace(`/(tabs)/entreprises/${entreprise.id}`);
    } catch {
      Alert.alert("Erreur", "Impossible de créer l'entreprise");
    }
  };

  return (
    <EntrepriseForm
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      isLoading={createMutation.isPending}
      submitLabel="Créer l'entreprise"
    />
  );
}
