import React from "react";
import { Alert, ActivityIndicator, View, Text } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEntreprise, useUpdateEntreprise } from "@/hooks/useEntreprises";
import { EntrepriseForm } from "@/components/forms/EntrepriseForm";
import type { CreateEntrepriseInput } from "@/services/entreprises";

export default function EditEntrepriseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: entreprise, isLoading } = useEntreprise(id!);
  const updateMutation = useUpdateEntreprise();

  const handleSubmit = async (data: CreateEntrepriseInput) => {
    try {
      await updateMutation.mutateAsync({ id: id!, data });
      router.back();
    } catch {
      Alert.alert("Erreur", "Impossible de modifier l'entreprise");
    }
  };

  if (isLoading) {
    return (
      <View>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!entreprise) {
    return (
      <View>
        <Text>Entreprise introuvable</Text>
      </View>
    );
  }

  return (
    <EntrepriseForm
      initialData={{
        nom: entreprise.nom,
        statut: entreprise.statut,
        rue: entreprise.rue || "",
        code_postal: entreprise.code_postal || "",
        ville: entreprise.ville || "",
        pays: entreprise.pays || "",
        description: entreprise.description || "",
        logo: entreprise.logo || "",
      }}
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      isLoading={updateMutation.isPending}
      submitLabel="Modifier l'entreprise"
      entrepriseId={id}
    />
  );
}
