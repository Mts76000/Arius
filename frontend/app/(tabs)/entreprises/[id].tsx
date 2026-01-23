import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEntreprise, useDeleteEntreprise } from "@/hooks/useEntreprises";
import Constants from "expo-constants";

const baseURL = Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:3000";

export default function EntrepriseDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: entreprise, isLoading, error } = useEntreprise(id as string);
  const deleteEntreprise = useDeleteEntreprise();

  const handleDelete = () => {
    Alert.alert(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer cette entreprise ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteEntreprise.mutateAsync(id as string);
              router.back();
            } catch (error) {
              Alert.alert("Erreur", "Impossible de supprimer l'entreprise");
            }
          },
        },
      ],
    );
  };

  const getStatutLabel = (statut: string) => {
    return statut === "a_reactiver" ? "À réactiver" : statut;
  };

  const getStatutStyle = (statut: string) => {
    switch (statut) {
      case "client":
        return styles.badgeClient;
      case "prospect":
        return styles.badgeProspect;
      case "fournisseur":
        return styles.badgeFournisseur;
      case "a_reactiver":
        return styles.badgeReactiver;
      default:
        return styles.badgeClient;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error || !entreprise) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Entreprise introuvable</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {entreprise.nom}
        </Text>
        <View style={[styles.badge, getStatutStyle(entreprise.statut)]}>
          <Text style={styles.badgeText}>
            {getStatutLabel(entreprise.statut)}
          </Text>
        </View>
      </View>

      {/* Logo */}
      {entreprise.logo && (
        <View style={styles.logoSection}>
          <Image
            source={{
              uri: entreprise.logo.startsWith("http")
                ? entreprise.logo
                : `${baseURL}${entreprise.logo}`,
            }}
            style={styles.logoImage}
          />
        </View>
      )}

      {/* Description Section */}
      {entreprise.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.text}>{entreprise.description}</Text>
        </View>
      )}

      {/* Address Section */}
      {(entreprise.rue ||
        entreprise.ville ||
        entreprise.code_postal ||
        entreprise.pays) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse</Text>
          <View style={styles.addressCard}>
            {entreprise.rue && (
              <Text style={styles.addressText}>{entreprise.rue}</Text>
            )}
            {(entreprise.code_postal || entreprise.ville) && (
              <Text style={styles.addressText}>
                {entreprise.code_postal && `${entreprise.code_postal} `}
                {entreprise.ville}
              </Text>
            )}
            {entreprise.pays && (
              <Text style={styles.addressText}>{entreprise.pays}</Text>
            )}
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push(`/entreprises/edit/${id}` as any)}
        >
          <Text style={styles.editButtonText}>Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={deleteEntreprise.isPending}
        >
          <Text style={styles.deleteButtonText}>
            {deleteEntreprise.isPending ? "..." : "Supprimer"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#ffffff",
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 12,
  },
  logoSection: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  badgeClient: {
    backgroundColor: "#10b981",
  },
  badgeProspect: {
    backgroundColor: "#f59e0b",
  },
  badgeFournisseur: {
    backgroundColor: "#3b82f6",
  },
  badgeReactiver: {
    backgroundColor: "#8b5cf6",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 12,
  },
  text: {
    color: "#6b7280",
    fontSize: 15,
    lineHeight: 22,
  },
  addressCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 6,
  },
  addressText: {
    color: "#4b5563",
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
  },
  editButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    alignItems: "center",
    boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)",
    elevation: 3,
  },
  editButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#dc2626",
    alignItems: "center",
    boxShadow: "0 2px 4px rgba(220, 38, 38, 0.2)",
    elevation: 3,
  },
  deleteButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 16,
  },
});
