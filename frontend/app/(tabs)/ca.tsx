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
import { Colors } from "@/constants/theme";
import { useCAStats, useCA, useCreateCA } from "@/hooks/useCA";
import { useObjectifs, useCreateObjectif } from "@/hooks/useObjectifs";
import { useEntreprises } from "@/hooks/useEntreprises";
import { ObjectifModal } from "@/components/modals/ObjectifModal";
import { CAModal } from "@/components/modals/CAModal";
import { AppButton } from "@/components/ui/AppButton";
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
    if (!progression) return Colors.light.muted;
    if (progression >= 100) return "#10b981";
    if (progression >= 90) return Colors.light.tint;
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header - Sélecteur mois/année */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleMoisPrecedent}
          style={styles.navButton}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.light.tint} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {MOIS_LABELS[selectedMois - 1]} {selectedAnnee}
        </Text>
        <TouchableOpacity onPress={handleMoisSuivant} style={styles.navButton}>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={Colors.light.tint}
          />
        </TouchableOpacity>
      </View>

      {/* KPIs du mois */}
      <View style={styles.kpisContainer}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>CA du mois</Text>
          <Text style={[styles.kpiValue, { color: Colors.light.tint }]}>
            {(stats?.ca_total || 0).toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            €
          </Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Objectif</Text>
          <Text style={[styles.kpiValue, { color: "#10b981" }]}>
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
        <View style={styles.progressionContainer}>
          <View style={styles.progressionHeader}>
            <Text style={styles.progressionLabel}>Progression</Text>
            <Text style={styles.progressionValue}>
              {getProgressionIcon(stats?.progression ?? null)}{" "}
              {stats?.progression?.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(stats?.progression || 0, 100)}%`,
                  backgroundColor: getProgressionColor(
                    stats?.progression ?? null,
                  ),
                },
              ]}
            />
          </View>
        </View>
      )}

      {/* Boutons actions */}
      <View style={styles.actionsContainer}>
        <AppButton
          title="Ajouter"
          onPress={() => setShowCAModal(true)}
          style={styles.actionButton}
        />
        <AppButton
          title="Objectif"
          onPress={() => setShowObjectifModal(true)}
          variant="secondary"
          style={styles.actionButton}
        />
      </View>

      {/* CA par entreprise */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CA par entreprise</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.light.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une entreprise..."
            value={rechercheEntreprise}
            onChangeText={setRechercheEntreprise}
            placeholderTextColor={Colors.light.muted}
          />
        </View>

        {entreprisesFiltrees && entreprisesFiltrees.length > 0 ? (
          entreprisesFiltrees.map((entreprise, index) => (
            <TouchableOpacity
              key={entreprise.entreprise_id}
              style={styles.entrepriseCard}
              onPress={() => handleEntrepriseClick(entreprise.entreprise_id)}
            >
              <View style={styles.entrepriseInfo}>
                <Text style={styles.entrepriseNom}>
                  {index === 0 && "🏆 "}
                  {entreprise.entreprise_nom}
                </Text>
              </View>
              <Text style={styles.entrepriseCA}>
                {(entreprise.ca_total || 0).toLocaleString("fr-FR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                €
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>Aucun CA ce mois</Text>
        )}
      </View>

      {/* Vue annuelle */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setShowAnnuelle(!showAnnuelle)}
        >
          <Text style={styles.sectionTitle}>Vue annuelle {selectedAnnee}</Text>
          <Ionicons
            name={showAnnuelle ? "chevron-up" : "chevron-down"}
            size={24}
            color={Colors.light.text}
          />
        </TouchableOpacity>

        {showAnnuelle && (
          <View style={styles.annuelleContainer}>
            {MOIS_LABELS.map((mois, index) => {
              const moisNum = index + 1;
              const caTotal = caParMois[index];

              return (
                <View key={moisNum} style={styles.moisRow}>
                  <Text style={styles.moisLabel}>{mois}</Text>
                  <Text style={styles.moisCA}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: Colors.light.card,
  },
  navButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  kpisContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  kpiLabel: {
    fontSize: 12,
    color: Colors.light.muted,
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
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  progressionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressionLabel: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  progressionValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  progressBar: {
    height: 12,
    backgroundColor: Colors.light.border,
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
    backgroundColor: Colors.light.tint,
    padding: 16,
    borderRadius: 12,
  },
  actionButtonSecondary: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.tint,
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
    color: Colors.light.text,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.light.card,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  entrepriseCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 8,
  },
  entrepriseInfo: {
    flex: 1,
  },
  entrepriseNom: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
  },
  entrepriseCA: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.tint,
  },
  emptyText: {
    textAlign: "center",
    color: Colors.light.muted,
    fontSize: 14,
    padding: 20,
  },
  annuelleContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: 16,
  },
  moisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  moisLabel: {
    fontSize: 14,
    color: Colors.light.text,
  },
  moisCA: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
  },
});
