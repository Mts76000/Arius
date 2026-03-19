import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  useCAEntreprise,
  useCreateCA,
  useUpdateCA,
  useDeleteCA,
} from "@/hooks/useCA";
import { CAModal } from "@/components/modals/CAModal";
import { CAMensuel } from "@/services/ca";
import { Entreprise } from "@/services/entreprises";
import { ActionMenu } from "@/components/ui/ActionMenu";

const MOIS_LABELS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

interface ChiffresTabProps {
  entreprise: Entreprise;
}

export const ChiffresTab: React.FC<ChiffresTabProps> = ({ entreprise }) => {
  const currentDate = new Date();
  const [selectedAnnee, setSelectedAnnee] = useState(currentDate.getFullYear());
  const [showCAModal, setShowCAModal] = useState(false);
  const [selectedCA, setSelectedCA] = useState<CAMensuel | null>(null);

  const { data: stats, isLoading } = useCAEntreprise(
    entreprise.id,
    selectedAnnee,
  );
  const createCAMutation = useCreateCA();
  const updateCAMutation = useUpdateCA();
  const deleteCAMutation = useDeleteCA();

  const annees = [
    currentDate.getFullYear() - 2,
    currentDate.getFullYear() - 1,
    currentDate.getFullYear(),
    currentDate.getFullYear() + 1,
  ];

  const handleAddCA = () => {
    setSelectedCA(null);
    setShowCAModal(true);
  };

  const handleEditCA = (ca: CAMensuel) => {
    setSelectedCA(ca);
    setShowCAModal(true);
  };

  const handleDeleteCA = (ca: CAMensuel) => {
    Alert.alert(
      "Supprimer le CA",
      `Supprimer le CA de ${MOIS_LABELS[ca.mois - 1]} ${ca.annee} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCAMutation.mutateAsync(ca.id);
            } catch (error) {
              Alert.alert("Erreur", "Impossible de supprimer le CA");
            }
          },
        },
      ],
    );
  };

  const handleSaveCA = async (data: {
    entreprise_id: string;
    mois: number;
    annee: number;
    ca_ht: number;
  }) => {
    try {
      if (selectedCA) {
        await updateCAMutation.mutateAsync({
          id: selectedCA.id,
          data: { ca_ht: data.ca_ht },
        });
      } else {
        await createCAMutation.mutateAsync(data);
      }
      setShowCAModal(false);
      setSelectedCA(null);
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'enregistrer le CA");
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1">
      <View className="p-5">
        {/* Header */}
        <View className="flex flex-row justify-between pt-5 pb-5">
          <Text className="text-lg font-bold">CA</Text>
          <TouchableOpacity onPress={handleAddCA}>
            <Text className="text-primary font-semibold text-lg">
              + Ajouter
            </Text>
          </TouchableOpacity>
        </View>

        {/* Année selector */}
        <View className="flex-row items-center justify-center gap-3 mb-5">
          <TouchableOpacity
            onPress={() => {
              const prevYear = annees.indexOf(selectedAnnee) - 1;
              if (prevYear >= 0) setSelectedAnnee(annees[prevYear]);
            }}
            disabled={annees.indexOf(selectedAnnee) === 0}
            className="h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white disabled:opacity-50"
          >
            <Ionicons name="chevron-back" size={20} color="#64748B" />
          </TouchableOpacity>

          <View className="flex-1 items-center rounded-lg border border-slate-200 bg-white py-2 px-3">
            <Text className="text-base font-semibold text-slate-900">
              {selectedAnnee}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              const nextYear = annees.indexOf(selectedAnnee) + 1;
              if (nextYear < annees.length) setSelectedAnnee(annees[nextYear]);
            }}
            disabled={annees.indexOf(selectedAnnee) === annees.length - 1}
            className="h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white disabled:opacity-50"
          >
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* KPI Cards */}
        <View className="flex-row gap-3 mb-5">
          <View className="flex-1 rounded-2xl border border-slate-100 bg-white p-4">
            <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              CA Total
            </Text>
            <Text className="text-2xl font-bold text-primary">
              {(stats?.ca_total || 0).toLocaleString("fr-FR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
              <Text className="text-base text-slate-400"> €</Text>
            </Text>
          </View>

          <View className="flex-1 rounded-2xl border border-slate-100 bg-white p-4">
            <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Moy. Mois
            </Text>
            <Text className="text-2xl font-bold text-orange-500">
              {(stats?.moyenne_mensuelle || 0).toLocaleString("fr-FR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
              <Text className="text-base text-slate-400"> €</Text>
            </Text>
          </View>
        </View>

        {/* CA Mensuel */}
        <View className="mb-5">
          <View className="pb-3">
            <Text className="text-lg font-bold">
              CA Mensuel {selectedAnnee}
            </Text>
          </View>

          {stats?.ca_mensuel && stats.ca_mensuel.length > 0 ? (
            <>
              <View className="bg-white rounded-3xl p-5 flex-col gap-3 mb-4">
                {stats.ca_mensuel.map((ca) => (
                  <View
                    key={ca.id}
                    className="flex-row items-center justify-between border-b border-slate-100 pb-3 last:border-b-0"
                  >
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-slate-900">
                        {MOIS_LABELS[ca.mois - 1]}
                      </Text>
                      <Text className="text-lg font-bold text-primary mt-1">
                        {ca.ca_ht.toLocaleString("fr-FR", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}{" "}
                        €
                      </Text>
                    </View>

                    <ActionMenu
                      items={[
                        {
                          key: `edit-${ca.id}`,
                          label: "Modifier",
                          icon: "pencil-outline",
                          iconColor: "#3B82F6",
                          onPress: () => handleEditCA(ca),
                        },
                        {
                          key: `delete-${ca.id}`,
                          label: "Supprimer",
                          icon: "trash-outline",
                          iconColor: "#EF4444",
                          textClassName: "text-red-500",
                          onPress: () => handleDeleteCA(ca),
                        },
                      ]}
                    />
                  </View>
                ))}
              </View>

              {/* Total */}
              <View className="rounded-2xl bg-primary p-4 flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-white">Total</Text>
                <Text className="text-xl font-bold text-white">
                  {(stats?.ca_total || 0).toLocaleString("fr-FR", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}{" "}
                  €
                </Text>
              </View>
            </>
          ) : (
            <View className="bg-primary rounded-3xl p-4 mt-4 flex items-center w-1/2 self-center">
              <Text className="text-white font-bold">Aucun CA</Text>
            </View>
          )}
        </View>

        {/* Modal */}
        <CAModal
          visible={showCAModal}
          onClose={() => {
            setShowCAModal(false);
            setSelectedCA(null);
          }}
          onSave={handleSaveCA}
          entreprises={[entreprise]}
          entrepriseIdInitial={entreprise.id}
          moisInitial={selectedCA?.mois}
          anneeInitiale={selectedCA?.annee || selectedAnnee}
          caInitial={selectedCA?.ca_ht}
          isEditing={!!selectedCA}
        />
      </View>
    </ScrollView>
  );
};
