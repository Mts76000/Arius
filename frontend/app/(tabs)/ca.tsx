import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useCAStats, useCA, useCreateCA } from "@/hooks/useCA";
import { useObjectifs, useCreateObjectif } from "@/hooks/useObjectifs";
import { useEntreprises } from "@/hooks/useEntreprises";
import { ObjectifModal } from "@/components/modals/ObjectifModal";
import { CAModal } from "@/components/modals/CAModal";
import { AppButton } from "@/components/ui/AppButton";
import { BtnPlus } from "@/components/ui/BtnPlus";

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

const getProgressionMeta = (progression: number | null) => {
  if (progression === null) {
    return { color: "#64748b", icon: "remove-circle-outline" as const };
  }
  if (progression >= 100) {
    return { color: "#10b981", icon: "checkmark-circle" as const };
  }
  if (progression >= 90) {
    return { color: "#007aff", icon: "trending-up" as const };
  }
  if (progression >= 50) {
    return { color: "#f59e0b", icon: "time-outline" as const };
  }
  return { color: "#ef4444", icon: "alert-circle-outline" as const };
};

export default function CAScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const currentDate = new Date();

  const [selectedMois, setSelectedMois] = useState(currentDate.getMonth() + 1);
  const [selectedAnnee, setSelectedAnnee] = useState(currentDate.getFullYear());
  const [rechercheEntreprise, setRechercheEntreprise] = useState("");
  const [showAnnuelle, setShowAnnuelle] = useState(false);
  const [showObjectifModal, setShowObjectifModal] = useState(false);
  const [showCAModal, setShowCAModal] = useState(false);

  const {
    data: stats,
    isLoading,
    refetch,
    isRefetching,
  } = useCAStats(selectedAnnee, selectedMois);
  const { data: objectifs } = useObjectifs(selectedAnnee);
  const { data: entreprisesData } = useEntreprises();
  const { data: caAnnuel } = useCA({ annee: selectedAnnee });

  const createObjectifMutation = useCreateObjectif();
  const createCAMutation = useCreateCA();

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

  const entreprisesFiltrees = useMemo(() => {
    const allEntreprises = stats?.ca_par_entreprise || [];
    const query = rechercheEntreprise.trim().toLowerCase();

    if (!query) return allEntreprises;

    return allEntreprises.filter((e) =>
      e.entreprise_nom.toLowerCase().includes(query),
    );
  }, [stats?.ca_par_entreprise, rechercheEntreprise]);

  const caParMois = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => {
      const moisNum = index + 1;
      const caMois = caAnnuel?.filter((ca) => ca.mois === moisNum) || [];
      return caMois.reduce((sum, ca) => sum + ca.ca_ht, 0);
    });
  }, [caAnnuel]);

  const totalAnnuel = useMemo(
    () => caParMois.reduce((sum, value) => sum + value, 0),
    [caParMois],
  );

  const progression = stats?.progression ?? null;
  const progressionMeta = getProgressionMeta(progression);
  const progressionWidth = Math.max(0, Math.min(progression ?? 0, 100));

  const handleSaveObjectifs = async (
    objectifsToSave: { mois: number; objectif_ht: number }[],
  ) => {
    try {
      for (const obj of objectifsToSave) {
        await createObjectifMutation.mutateAsync({
          annee: selectedAnnee,
          mois: obj.mois,
          objectif_ht: obj.objectif_ht,
        });
      }
      Alert.alert("Succès", "Objectifs enregistrés");
      setShowObjectifModal(false);
    } catch {
      Alert.alert("Erreur", "Impossible d'enregistrer les objectifs");
    }
  };

  const handleSaveCA = async (data: {
    entreprise_id: string;
    mois: number;
    annee: number;
    ca_ht: number;
  }) => {
    try {
      await createCAMutation.mutateAsync(data);
      Alert.alert("Succès", "CA enregistré");
      setShowCAModal(false);
    } catch {
      Alert.alert("Erreur", "Impossible d'enregistrer le CA");
    }
  };

  const handleEntrepriseClick = (entrepriseId: string) => {
    router.push(`/(tabs)/entreprises/${entrepriseId}` as any);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#007aff" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScrollView
        className="pt-4"
        contentContainerStyle={{
          alignSelf: "center",
          maxWidth: 1120,
          paddingBottom: isDesktop ? 48 : 180,
          paddingHorizontal: isDesktop ? 32 : 20,
          width: "100%",
        }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        <View className="gap-6">
          <View className="bg-white rounded-3xl p-5 shadow-base">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={handleMoisPrecedent}
                className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10"
              >
                <Ionicons name="chevron-back" size={20} color="#007aff" />
              </TouchableOpacity>

              <View className="items-center flex-1 px-2">
                <Text className="text-2xl font-bold text-black">
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

          <View className="flex-row gap-3">
            <View className="flex-1 bg-white rounded-3xl p-5 shadow-base ">
              <View className="flex-row items-center gap-2 mb-2">
                <Text className="text-slate-500 text-sm font-semibold">
                  CA du mois
                </Text>
              </View>
              <Text className="text-2xl font-bold text-slate-900">
                {formatEuro(stats?.ca_total || 0)}
              </Text>
            </View>

            <View className="flex-1 bg-white rounded-3xl p-5 shadow-base">
              <View className="flex-row items-center gap-2 mb-2">
                <Text className="text-slate-500 text-sm font-semibold">
                  Objectif
                </Text>
              </View>
              <Text className="text-2xl font-bold text-slate-900">
                {stats?.objectif !== null
                  ? formatEuro(stats?.objectif || 0)
                  : "Non défini"}
              </Text>
            </View>
          </View>

          {progression !== null && (
            <View className="bg-white rounded-3xl p-5 shadow-base">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-base font-semibold text-black">
                  Progression mensuelle
                </Text>
                <View className="flex-row items-center gap-1">
                  <Ionicons
                    name={progressionMeta.icon}
                    size={18}
                    color={progressionMeta.color}
                  />
                  <Text
                    className="text-base font-bold"
                    style={{ color: progressionMeta.color }}
                  >
                    {progression.toFixed(1)}%
                  </Text>
                </View>
              </View>

              <View className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${progressionWidth}%`,
                    backgroundColor: progressionMeta.color,
                  }}
                />
              </View>
            </View>
          )}

          <View className="flex-row gap-3">
            <View className="flex-1">
              <AppButton
                title="Objectifs annuels"
                onPress={() => setShowObjectifModal(true)}
                variant="secondary"
                className="rounded-xl border border-grayLight bg-gray-100 text-gray-700"
              />
            </View>
            <View className="flex-1">
              <AppButton
                title="Ajouter du CA"
                onPress={() => setShowCAModal(true)}
                variant="primary"
                className="rounded-xl bg-primary"
              />
            </View>
          </View>

          <View>
            <View className="mb-3 flex-row items-center mt-3 gap-3">
              <View>
                <Text className="text-xl font-semibold text-black  tracking-wide">
                  CA par entreprise
                </Text>
              </View>
            </View>

            <View className="mb-3 rounded-2xl  bg-white px-4 py-3 shadow-base">
              <View className="flex-row items-center  gap-2">
                <Ionicons name="search" size={18} color="#64748b" />
                <TextInput
                  className="flex-1 text-base text-slate-900"
                  placeholder="Rechercher une entreprise..."
                  value={rechercheEntreprise}
                  onChangeText={setRechercheEntreprise}
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>

            {entreprisesFiltrees.length > 0 ? (
              <View className="gap-3">
                {entreprisesFiltrees.map((entreprise, index) => (
                  <TouchableOpacity
                    key={entreprise.entreprise_id}
                    onPress={() =>
                      handleEntrepriseClick(entreprise.entreprise_id)
                    }
                    className="bg-white rounded-3xl p-5 shadow-base"
                  >
                    <View className="flex-row items-center justify-between gap-4">
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-1">
                          <Text
                            className="text-base font-semibold text-slate-900 flex-1"
                            numberOfLines={1}
                          >
                            {entreprise.entreprise_nom}
                          </Text>
                        </View>
                      </View>

                      <Text className="text-base font-bold text-primary">
                        {formatEuro(entreprise.ca_total || 0)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View className="items-center justify-center rounded-3xl bg-white px-6 py-10 shadow-base">
                <Text className="mb-1 text-lg font-semibold text-slate-900">
                  Aucun résultat
                </Text>
                <Text className="text-center text-sm text-slate-600">
                  Aucun CA trouvé pour ce filtre.
                </Text>
              </View>
            )}
          </View>

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
                    <Text className="text-sm  text-slate-900">
                      {formatEuro(caParMois[index] || 0)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <BtnPlus formType="ca" onOpenCA={() => setShowCAModal(true)} />

      <ObjectifModal
        visible={showObjectifModal}
        onClose={() => setShowObjectifModal(false)}
        onSave={handleSaveObjectifs}
        annee={selectedAnnee}
        objectifsExistants={objectifs?.map((o) => ({
          mois: o.mois,
          objectif_ht: o.objectif_ht,
        }))}
      />

      <CAModal
        visible={showCAModal}
        onClose={() => setShowCAModal(false)}
        onSave={handleSaveCA}
        entreprises={entreprisesData?.entreprises || []}
        moisInitial={selectedMois}
        anneeInitiale={selectedAnnee}
      />
    </View>
  );
}
