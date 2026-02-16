import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useDevis, useUploadDevis, useDeleteDevis } from "@/hooks/useDevis";
import { devisService } from "@/services/devis";
import { DevisModal } from "@/components/modals/DevisModal";
import { styles } from "@/styles/entrepriseDetailStyles";
import { AppButton } from "@/components/ui/AppButton";

interface DevisSectionProps {
  entrepriseId: string;
}

export function DevisSection({ entrepriseId }: DevisSectionProps) {
  const { data: devis, isLoading, error } = useDevis(entrepriseId);
  const uploadMutation = useUploadDevis(entrepriseId);
  const deleteMutation = useDeleteDevis(entrepriseId);

  const [search, setSearch] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  const filteredDevis =
    devis?.filter((d) => d.nom.toLowerCase().includes(search.toLowerCase())) ||
    [];

  const handleDeleteDevis = (id: string) => {
    if (Platform.OS === "web") {
      const ok = window.confirm(
        "Êtes-vous sûr de vouloir supprimer ce devis ?",
      );
      if (ok) {
        deleteMutation.mutate(id);
      }
      return;
    }

    Alert.alert(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer ce devis ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => deleteMutation.mutate(id),
        },
      ],
    );
  };

  const handleDownloadDevis = (devisItem: any) => {
    if (Platform.OS === "web") {
      window.open(devisService.getFileUrl(devisItem.url_fichier), "_blank");
    }
  };

  if (isLoading) {
    return (
      <View style={{ paddingVertical: 40 }}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 14, color: "#ef4444", marginBottom: 12 }}>
          Erreur lors du chargement des devis
        </Text>
        <AppButton
          title="Reessayer"
          onPress={() => window.location.reload()}
          size="sm"
        />
      </View>
    );
  }

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
      {/* Header */}
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: "#0f172a",
            marginBottom: 12,
          }}
        >
          📄 Devis
        </Text>
        <AppButton
          title="+ Upload devis"
          onPress={() => setShowUploadModal(true)}
          size="sm"
        />
      </View>

      {/* Search */}
      {(devis?.length ?? 0) > 0 && (
        <View style={{ marginBottom: 12 }}>
          <TextInput
            style={[styles.input, { height: 40 }]}
            placeholder="Rechercher un devis..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
      )}

      {/* Liste */}
      {filteredDevis.length > 0 ? (
        <ScrollView style={{ maxHeight: 400 }}>
          {filteredDevis.map((devisItem) => (
            <View
              key={devisItem._id}
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: 8,
                padding: 12,
                marginBottom: 8,
                borderLeftWidth: 4,
                borderLeftColor: "#0ea5e9",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#0f172a",
                  marginBottom: 4,
                }}
              >
                {devisItem.nom}
              </Text>
              <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                {devisService.formatFileSize(devisItem.taille_octets)} •{" "}
                {new Date(devisItem.createdAt).toLocaleDateString("fr-FR")}
              </Text>
              {devisItem.notes && (
                <Text
                  style={{
                    fontSize: 12,
                    color: "#64748b",
                    marginBottom: 8,
                    fontStyle: "italic",
                  }}
                >
                  {devisItem.notes}
                </Text>
              )}
              <View style={{ flexDirection: "row", gap: 8 }}>
                <AppButton
                  title="Voir"
                  onPress={() => handleDownloadDevis(devisItem)}
                  variant="secondary"
                  size="sm"
                  style={{ flex: 1 }}
                />
                <AppButton
                  title="Supprimer"
                  onPress={() => handleDeleteDevis(devisItem._id)}
                  variant="danger"
                  size="sm"
                  disabled={deleteMutation.isPending}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={{ alignItems: "center", paddingVertical: 32 }}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>📄</Text>
          <Text style={{ fontSize: 14, color: "#64748b" }}>
            Aucun devis pour cette entreprise
          </Text>
        </View>
      )}

      {/* Modal */}
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
