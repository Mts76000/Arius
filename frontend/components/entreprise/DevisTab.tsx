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

interface DevisTabProps {
  entrepriseId: string;
}

export function DevisTab({ entrepriseId }: DevisTabProps) {
  const { data: devis, isLoading, error } = useDevis(entrepriseId);
  const uploadMutation = useUploadDevis(entrepriseId);
  const deleteMutation = useDeleteDevis(entrepriseId);

  const [search, setSearch] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const hasSearchQuery = search.trim().length > 0;

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
        <Text className="text-lg font-semibold text-slate-900">Devis</Text>
        <TouchableOpacity onPress={() => setShowUploadModal(true)}>
          <Text className="text-base font-semibold text-primary">+ Ajouter</Text>
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

      <View className="mt-5">
        {isLoading ? (
          <View className="bg-white rounded-3xl p-5 flex-col gap-4">
            <ActivityIndicator size="small" color="#0ea5e9" />
          </View>
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
          <View className="bg-white rounded-3xl p-5 flex-col gap-4">
            {filteredDevis.map((devisItem) => (
              <DevisCard
                key={devisItem._id}
                devis={devisItem}
                onView={() => handleOpenDevis(devisItem.url_fichier)}
                onDelete={() => handleDeleteDevis(devisItem._id)}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </View>
        ) : hasSearchQuery ? (
          <View className="rounded-3xl border border-slate-100 bg-white px-6 py-8 mt-8 items-center">
            <Text className="text-base font-semibold text-slate-900">
              Aucun devis trouvé
            </Text>
            <Text className="mt-1 text-center text-sm text-slate-500">
              Essayez un autre mot-clé.
            </Text>
          </View>
        ) : (
          <View className="rounded-3xl border border-slate-100 bg-white px-6 py-8 mt-8 items-center">
            <Text className="text-base font-semibold text-slate-900">
              Aucun devis
            </Text>
            <Text className="mt-1 text-center text-sm text-slate-500">
              Ajoutez un devis pour le retrouver dans la fiche entreprise.
            </Text>
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
