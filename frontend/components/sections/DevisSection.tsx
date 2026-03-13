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
      <View>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (error) {
    return (
      <View
      >
        <Text>
          Erreur lors du chargement des devis
        </Text>
        <AppButton
          title="Reessayer"
          onPress={() => window.location.reload()}
         
        />
      </View>
    );
  }

  return (
    <View>
      {/* Header */}
      <View>
        <Text
        >
          📄 Devis
        </Text>
        <AppButton
          title="+ Upload devis"
          onPress={() => setShowUploadModal(true)}
         
        />
      </View>

      {/* Search */}
      {(devis?.length ?? 0) > 0 && (
        <View>
          <TextInput
            placeholder="Rechercher un devis..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
      )}

      {/* Liste */}
      {filteredDevis.length > 0 ? (
        <ScrollView>
          {filteredDevis.map((devisItem) => (
            <View
              key={devisItem._id}
            >
              <Text
              >
                {devisItem.nom}
              </Text>
              <Text>
                {devisService.formatFileSize(devisItem.taille_octets)} •{" "}
                {new Date(devisItem.createdAt).toLocaleDateString("fr-FR")}
              </Text>
              {devisItem.notes && (
                <Text
                >
                  {devisItem.notes}
                </Text>
              )}
              <View>
                <AppButton
                  title="Voir"
                  onPress={() => handleDownloadDevis(devisItem)}
                  variant="secondary"
                 
                />
                <AppButton
                  title="Supprimer"
                  onPress={() => handleDeleteDevis(devisItem._id)}
                  variant="danger"
                 
                  disabled={deleteMutation.isPending}
                />
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View>
          <Text>📄</Text>
          <Text>
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
