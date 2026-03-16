import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useCAStats, useCA, useCreateCA } from "@/hooks/useCA";
import { useObjectifs, useCreateObjectif } from "@/hooks/useObjectifs";
import { useEntreprises } from "@/hooks/useEntreprises";
import { ObjectifModal } from "@/components/modals/ObjectifModal";
import { CAModal } from "@/components/modals/CAModal";
import { AppButton } from "@/components/ui/AppButton";
import { BtnPlus } from "@/components/ui/BtnPlus";
import { useRouter } from "expo-router";

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

export default function CAScreen() {
  const currentDate = new Date();
  const [selectedMois, setSelectedMois] = useState(currentDate.getMonth() + 1);
  const [selectedAnnee, setSelectedAnnee] = useState(currentDate.getFullYear());
  const [rechercheEntreprise, setRechercheEntreprise] = useState("");
  const [showAnnuelle, setShowAnnuelle] = useState(false);
  const [showObjectifModal, setShowObjectifModal] = useState(false);
  const [showCAModal, setShowCAModal] = useState(false);
  const router = useRouter();

  const { data: stats, isLoading } = useCAStats(selectedAnnee, selectedMois);
  const { data: objectifs } = useObjectifs(selectedAnnee);
  const { data: entreprisesData } = useEntreprises();
  const { data: caAnnuel } = useCA({ annee: selectedAnnee });
  const createObjectifMutation = useCreateObjectif();
  const createCAMutation = useCreateCA();

  const handleMoisPrecedent = () => {
    if (selectedMois === 1) {
      setSelectedMois(12);
      setSelectedAnnee(selectedAnnee - 1);
    } else {
      setSelectedMois(selectedMois - 1);
    }
  };

  const handleMoisSuivant = () => {
    if (selectedMois === 12) {
      setSelectedMois(1);
      setSelectedAnnee(selectedAnnee + 1);
    } else {
      setSelectedMois(selectedMois + 1);
    }
  };

  const getProgressionColor = (progression: number | null) => {
    if (!progression) return "#64748b";
    if (progression >= 100) return "#10b981";
    if (progression >= 90) return "#0ea5e9";
    if (progression >= 50) return "#f59e0b";
    return "#ef4444";
  };

  const getProgressionIcon = (progression: number | null) => {
    if (!progression) return "⚪";
    if (progression >= 100) return "⭐";
    if (progression >= 90) return "🟢";
    if (progression >= 50) return "🟡";
    return "🔴";
  };

  const entreprisesFiltrees = stats?.ca_par_entreprise.filter((e) =>
    e.entreprise_nom.toLowerCase().includes(rechercheEntreprise.toLowerCase()),
  );

  // Calculer CA par mois pour la vue annuelle
  const caParMois = Array.from({ length: 12 }, (_, index) => {
    const moisNum = index + 1;
    const caMois = caAnnuel?.filter((ca) => ca.mois === moisNum) || [];
    const total = caMois.reduce((sum, ca) => sum + ca.ca_ht, 0);
    return total;
  });

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
    } catch (error) {
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
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'enregistrer le CA");
    }
  };

  const handleEntrepriseClick = (entrepriseId: string) => {
    router.push(`/(tabs)/entreprises/${entrepriseId}` as any);
  };

  if (isLoading) {
    return (
      <View>
        <ActivityIndicator size="large" color={"#0ea5e9"} />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 180 }}>
        {/* Header - Sélecteur mois/année */}
        <View>
          <TouchableOpacity onPress={handleMoisPrecedent}>
            <Ionicons name="chevron-back" size={24} color={"#0ea5e9"} />
          </TouchableOpacity>
          <Text>
            {MOIS_LABELS[selectedMois - 1]} {selectedAnnee}
          </Text>
          <TouchableOpacity onPress={handleMoisSuivant}>
            <Ionicons name="chevron-forward" size={24} color={"#0ea5e9"} />
          </TouchableOpacity>
        </View>

        {/* KPIs du mois */}
        <View>
          <View>
            <Text>CA du mois</Text>
            <Text>
              {(stats?.ca_total || 0).toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              €
            </Text>
          </View>
          <View>
            <Text>Objectif</Text>
            <Text>
              {stats?.objectif
                ? `${(stats.objectif || 0).toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} €`
                : "Non défini"}
            </Text>
          </View>
        </View>

        {/* Barre de progression */}
        {stats?.progression !== null && (
          <View>
            <View>
              <Text>Progression</Text>
              <Text>
                {getProgressionIcon(stats?.progression ?? null)}{" "}
                {stats?.progression?.toFixed(1)}%
              </Text>
            </View>
            <View>
              <View />
            </View>
          </View>
        )}

        {/* Boutons actions */}
        <View>
          <AppButton
            title="Objectif"
            onPress={() => setShowObjectifModal(true)}
            variant="secondary"
          />
        </View>

        {/* CA par entreprise */}
        <View>
          <Text>CA par entreprise</Text>
          <View>
            <Ionicons name="search" size={20} color={"#64748b"} />
            <TextInput
              placeholder="Rechercher une entreprise..."
              value={rechercheEntreprise}
              onChangeText={setRechercheEntreprise}
              placeholderTextColor={"#64748b"}
            />
          </View>

          {entreprisesFiltrees && entreprisesFiltrees.length > 0 ? (
            entreprisesFiltrees.map((entreprise, index) => (
              <TouchableOpacity
                key={entreprise.entreprise_id}
                onPress={() => handleEntrepriseClick(entreprise.entreprise_id)}
              >
                <View>
                  <Text>
                    {index === 0 && "🏆 "}
                    {entreprise.entreprise_nom}
                  </Text>
                </View>
                <Text>
                  {(entreprise.ca_total || 0).toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  €
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text>Aucun CA ce mois</Text>
          )}
        </View>

        {/* Vue annuelle */}
        <View>
          <TouchableOpacity onPress={() => setShowAnnuelle(!showAnnuelle)}>
            <Text>Vue annuelle {selectedAnnee}</Text>
            <Ionicons
              name={showAnnuelle ? "chevron-up" : "chevron-down"}
              size={24}
              color={"#0f172a"}
            />
          </TouchableOpacity>

          {showAnnuelle && (
            <View>
              {MOIS_LABELS.map((mois, index) => {
                const moisNum = index + 1;
                const caTotal = caParMois[index];

                return (
                  <View key={moisNum}>
                    <Text>{mois}</Text>
                    <Text>
                      {(caTotal || 0).toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      €
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Modals */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#ffffff",
  },
  navButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
  },
  kpisContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  kpiLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  progressionContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  progressionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressionLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  progressionValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  progressBar: {
    height: 12,
    backgroundColor: "#e2e8f0",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  actionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0ea5e9",
    padding: 16,
    borderRadius: 12,
  },
  actionButtonSecondary: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#0ea5e9",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#0f172a",
  },
  entrepriseCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 8,
  },
  entrepriseInfo: {
    flex: 1,
  },
  entrepriseNom: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  entrepriseCA: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0ea5e9",
  },
  emptyText: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 14,
    padding: 20,
  },
  annuelleContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
  },
  moisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  moisLabel: {
    fontSize: 14,
    color: "#0f172a",
  },
  moisCA: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
});
