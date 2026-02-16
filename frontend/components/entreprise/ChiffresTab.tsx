import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { Colors } from "@/constants/theme";
import {
  useCAEntreprise,
  useCreateCA,
  useUpdateCA,
  useDeleteCA,
} from "@/hooks/useCA";
import { CAModal } from "@/components/modals/CAModal";
import { CAMensuel } from "@/services/ca";
import { Entreprise } from "@/services/entreprises";
import { AppButton } from "@/components/ui/AppButton";

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
              Alert.alert("Succès", "CA supprimé");
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
        Alert.alert("Succès", "CA mis à jour");
      } else {
        await createCAMutation.mutateAsync(data);
        Alert.alert("Succès", "CA enregistré");
      }
      setShowCAModal(false);
      setSelectedCA(null);
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'enregistrer le CA");
    }
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
      <View style={styles.header}>
        <AppButton
          title="Ajouter du CA"
          onPress={handleAddCA}
          style={styles.addButton}
        />

        <View style={styles.yearSelector}>
          <Picker
            selectedValue={selectedAnnee}
            onValueChange={(value) => setSelectedAnnee(value)}
            style={styles.picker}
          >
            {annees.map((annee) => (
              <Picker.Item key={annee} label={annee.toString()} value={annee} />
            ))}
          </Picker>
        </View>
      </View>

      {/* KPIs */}
      <View style={styles.kpisContainer}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>CA total {selectedAnnee}</Text>
          <Text style={styles.kpiValue}>
            {(stats?.ca_total || 0).toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            €
          </Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Moyenne mensuelle</Text>
          <Text style={styles.kpiValue}>
            {(stats?.moyenne_mensuelle || 0).toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            €
          </Text>
        </View>
      </View>

      {/* CA mensuel */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CA mensuel</Text>

        {stats?.ca_mensuel && stats.ca_mensuel.length > 0 ? (
          <View style={styles.caList}>
            {stats.ca_mensuel.map((ca) => (
              <View key={ca.id} style={styles.caCard}>
                <View style={styles.caInfo}>
                  <Text style={styles.caMonth}>
                    {MOIS_LABELS[ca.mois - 1]} {ca.annee}
                  </Text>
                  <Text style={styles.caAmount}>
                    {ca.ca_ht.toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    €
                  </Text>
                </View>
                <View style={styles.caActions}>
                  <TouchableOpacity
                    style={styles.actionIcon}
                    onPress={() => handleEditCA(ca)}
                  >
                    <Ionicons
                      name="pencil"
                      size={20}
                      color={Colors.light.tint}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionIcon}
                    onPress={() => handleDeleteCA(ca)}
                  >
                    <Ionicons name="trash" size={20} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total {selectedAnnee}</Text>
              <Text style={styles.totalAmount}>
                {(stats?.ca_total || 0).toLocaleString("fr-FR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                €
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.emptyText}>Aucun CA pour {selectedAnnee}</Text>
        )}
      </View>

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
    </ScrollView>
  );
};

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
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  addButton: {
    alignSelf: "flex-start",
  },
  yearSelector: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.card,
    overflow: "hidden",
    flex: 1,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  kpisContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
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
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.tint,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 12,
  },
  caList: {
    gap: 8,
  },
  caCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  caInfo: {
    flex: 1,
  },
  caMonth: {
    fontSize: 14,
    color: Colors.light.muted,
    marginBottom: 4,
  },
  caAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  caActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionIcon: {
    padding: 4,
  },
  totalCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.light.tint,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  emptyText: {
    textAlign: "center",
    color: Colors.light.muted,
    fontSize: 14,
    padding: 20,
  },
});
