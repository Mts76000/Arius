import React, { useState, useMemo } from "react";
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

const formatEuro = (value: number) => {
  return `${value.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} EUR`;
};

interface ChiffresTabProps {
  entreprise: Entreprise;
}

export const ChiffresTab: React.FC<ChiffresTabProps> = ({ entreprise }) => {
  const currentDate = new Date();
  const [selectedMois, setSelectedMois] = useState(currentDate.getMonth() + 1);
  const [selectedAnnee, setSelectedAnnee] = useState(currentDate.getFullYear());
  const [showCAModal, setShowCAModal] = useState(false);
  const [selectedCA, setSelectedCA] = useState<CAMensuel | null>(null);
  const [showAnnuelle, setShowAnnuelle] = useState(false);

  const { data: stats, isLoading } = useCAEntreprise(
    entreprise.id,
    selectedAnnee,
  );
  const createCAMutation = useCreateCA();
  const updateCAMutation = useUpdateCA();
  const deleteCAMutation = useDeleteCA();

  // Filtrer les données par mois
  const caMensuelFiltre =
    stats?.ca_mensuel?.filter((ca) => ca.mois === selectedMois) || [];

  // Calculer le CA par mois pour l'année
  const caParMois = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => {
      const moisNum = index + 1;
      const caMois =
        stats?.ca_mensuel?.filter((ca) => ca.mois === moisNum) || [];
      return caMois.reduce((sum, ca) => sum + ca.ca_ht, 0);
    });
  }, [stats?.ca_mensuel]);

  // Calculer le total annuel
  const totalAnnuel = useMemo(
    () => caParMois.reduce((sum, value) => sum + value, 0),
    [caParMois],
  );

  const handleMoisPrecedent = () => {
    if (selectedMois === 1) {
      setSelectedMois(12);
      setSelectedAnnee((prev) => prev - 1);
      return;
    }
    setSelectedMois((prev) => prev - 1);
  };

  const handleMoisSuivant = () => {
    if (selectedMois === 12) {
      setSelectedMois(1);
      setSelectedAnnee((prev) => prev + 1);
      return;
    }
    setSelectedMois((prev) => prev + 1);
  };

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
            } catch {
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
    } catch {
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
      <View className="p-5 flex gap-5">
        {/* Header */}
        <View className="flex flex-row justify-between pt-5 pb-5">
          <Text className="text-lg font-semibold text-slate-900">CA</Text>
          <TouchableOpacity onPress={handleAddCA}>
            <Text className="text-base font-semibold text-primary">
              + Ajouter
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sélecteur de mois */}
        <View className="bg-white rounded-3xl p-5 shadow-base">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={handleMoisPrecedent}
              className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10"
            >
              <Ionicons name="chevron-back" size={20} color="#007aff" />
            </TouchableOpacity>

            <View className="items-center flex-1 px-2">
              <Text className="text-lg font-semibold text-slate-900">
                {MOIS_LABELS[selectedMois - 1]} {selectedAnnee}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleMoisSuivant}
              className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10"
            >
              <Ionicons name="chevron-forward" size={20} color="#007aff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* KPI Cards */}
        <View className="flex-row gap-3 mb-5">
          <View className="flex-1 rounded-2xl border border-slate-100 bg-white p-4">
            <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              CA Total
            </Text>
            <Text className="text-lg font-semibold text-primary">
              {(stats?.ca_total || 0).toLocaleString("fr-FR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
              <Text className="text-sm text-slate-400"> €</Text>
            </Text>
          </View>

          <View className="flex-1 rounded-2xl border border-slate-100 bg-white p-4">
            <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Moy. Mois
            </Text>
            <Text className="text-lg font-semibold text-orange-500">
              {(stats?.moyenne_mensuelle || 0).toLocaleString("fr-FR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
              <Text className="text-sm text-slate-400"> €</Text>
            </Text>
          </View>
        </View>

        {/* CA Mensuel */}
        <View className="">
          <View className="pb-3">
            <Text className="text-lg font-semibold text-slate-900">
              CA Mensuel {selectedAnnee}
            </Text>
          </View>

          {caMensuelFiltre.length > 0 ? (
            <>
              <View className="bg-white rounded-3xl p-5 flex-col gap-3 mb-4">
                {caMensuelFiltre.map((ca) => (
                  <View
                    key={ca.id}
                    className="flex-row items-center justify-between border-b border-slate-100 pb-3 last:border-b-0"
                  >
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-slate-900">
                        {MOIS_LABELS[ca.mois - 1]}
                      </Text>
                      <Text className="text-base font-semibold text-primary mt-1">
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
            </>
          ) : (
            <View className="rounded-3xl border border-slate-100 bg-white px-6 py-8 mt-4 items-center">
              <Text className="text-base font-semibold text-slate-900">
                Aucun CA
              </Text>
              <Text className="mt-1 text-center text-sm text-slate-500">
                {"Ajoutez un montant pour suivre l'activité de cette entreprise."}
              </Text>
            </View>
          )}
        </View>

        {/* Vue annuelle */}
        <View className="bg-white rounded-3xl p-5 shadow-base">
          <TouchableOpacity
            onPress={() => setShowAnnuelle((prev) => !prev)}
            className="flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3 flex-1">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <Ionicons name="calendar-outline" size={18} color="#007aff" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-slate-900">
                  Vue annuelle {selectedAnnee}
                </Text>
                <Text className="text-sm text-slate-500">
                  Total: {formatEuro(totalAnnuel)}
                </Text>
              </View>
            </View>
            <Ionicons
              name={showAnnuelle ? "chevron-up" : "chevron-down"}
              size={22}
              color="#0f172a"
            />
          </TouchableOpacity>

          {showAnnuelle && (
            <View className="mt-4 gap-2">
              {MOIS_LABELS.map((mois, index) => (
                <View
                  key={mois}
                  className={`flex-row items-center justify-between rounded-xl px-3 py-2 ${
                    index + 1 === selectedMois
                      ? "bg-primary/10 border border-primary/20"
                      : "bg-slate-50"
                  }`}
                >
                  <Text className="text-sm font-medium text-slate-700">
                    {mois}
                  </Text>
                  <Text className="text-sm text-slate-900">
                    {formatEuro(caParMois[index] || 0)}
                  </Text>
                </View>
              ))}
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
          moisInitial={selectedMois}
          anneeInitiale={selectedAnnee}
          caInitial={selectedCA?.ca_ht}
          isEditing={!!selectedCA}
        />
      </View>
    </ScrollView>
  );
};
