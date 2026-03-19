import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
} from "react-native";
import { useDevis, useUploadDevis, useDeleteDevis } from "@/hooks/useDevis";
import { devisService } from "@/services/devis";
import { DevisModal } from "@/components/modals/DevisModal";
import { DevisCard } from "@/components/cards/DevisCard";
import { AppButton } from "@/components/ui/AppButton";

interface DevisTabProps {
  entrepriseId: string;
}

export function DevisTab({ entrepriseId }: DevisTabProps) {
  const { data: devis, isLoading, error } = useDevis(entrepriseId);
  const uploadMutation = useUploadDevis(entrepriseId);
  const deleteMutation = useDeleteDevis(entrepriseId);

  const [search, setSearch] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  const filteredDevis = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return devis || [];

    return (devis || []).filter((d) => {
      const nom = d.nom.toLowerCase();
      const fichier = d.nom_fichier.toLowerCase();
      const notes = d.notes?.toLowerCase() || "";
      return (
        nom.includes(query) || fichier.includes(query) || notes.includes(query)
      );
    });
  }, [devis, search]);

  const handleDeleteDevis = (id: string) => {
    const doDelete = async () => {
      try {
        await deleteMutation.mutateAsync(id);
      } catch {
        Alert.alert("Erreur", "Impossible de supprimer ce devis");
      }
    };

    if (Platform.OS === "web") {
      const ok = window.confirm(
        "Êtes-vous sûr de vouloir supprimer ce devis ?",
      );
      if (ok) doDelete();
      return;
    }

    Alert.alert(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer ce devis ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: doDelete },
      ],
    );
  };

  const handleOpenDevis = (urlFichier: string) => {
    if (Platform.OS === "web") {
      window.open(devisService.getFileUrl(urlFichier), "_blank");
      return;
    }
    Alert.alert(
      "Info",
      "Ouverture directe dispo en version web pour le moment",
    );
  };

  return (
    <View className="p-5">
      <View className="flex flex-row justify-between pt-5">
        <Text className="text-lg font-bold">Devis</Text>
        <TouchableOpacity onPress={() => setShowUploadModal(true)}>
          <Text className="text-primary font-semibold text-lg">+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {(devis?.length ?? 0) > 0 && (
        <View className="mt-4 rounded-xl border border-slate-200 bg-white px-3">
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Rechercher un devis..."
            placeholderTextColor="#94a3b8"
            className="py-3 text-slate-900"
          />
        </View>
      )}

      <View className="mt-4 gap-3">
        {isLoading ? (
          <ActivityIndicator size="small" color="#0ea5e9" />
        ) : error ? (
          <View className="rounded-2xl border border-red-100 bg-red-50 p-4">
            <Text className="font-semibold text-red-700">
              Erreur de chargement
            </Text>
            <Text className="mt-1 text-sm text-red-600">
              Impossible de récupérer les devis.
            </Text>
          </View>
        ) : filteredDevis.length > 0 ? (
          filteredDevis.map((devisItem) => (
            <DevisCard
              key={devisItem._id}
              devis={devisItem}
              onView={() => handleOpenDevis(devisItem.url_fichier)}
              onDelete={() => handleDeleteDevis(devisItem._id)}
              isDeleting={deleteMutation.isPending}
            />
          ))
        ) : (
          <View className="items-center rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <Text className="text-3xl">📄</Text>
            <Text className="mt-2 text-base font-semibold text-slate-900">
              Aucun devis pour cette entreprise
            </Text>
            <Text className="mt-1 text-center text-sm text-slate-500">
              Upload ton premier devis PDF pour commencer.
            </Text>
            <View className="mt-4 w-full">
              <AppButton
                title="+ Ajouter un devis"
                onPress={() => setShowUploadModal(true)}
              />
            </View>
          </View>
        )}
      </View>

      <DevisModal
        visible={showUploadModal}
        onSubmit={async (data) => {
          await uploadMutation.mutateAsync(data);
        }}
        onClose={() => setShowUploadModal(false)}
        isLoading={uploadMutation.isPending}
      />
    </View>
  );
}
