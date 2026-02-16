import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEntreprises } from "@/hooks/useEntreprises";
import type { Entreprise } from "@/services/entreprises";
import Constants from "expo-constants";
import { Colors } from "@/constants/theme";
import { AppButton } from "@/components/ui/AppButton";

const baseURL = Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:3000";

export default function EntreprisesScreen() {
  const router = useRouter();
  const [recherche, setRecherche] = useState("");
  const [statutFilter, setStatutFilter] = useState<
    "client" | "prospect" | "fournisseur" | "a_reactiver" | undefined
  >();

  const { data, isLoading, error, refetch } = useEntreprises({
    recherche: recherche || undefined,
    statut: statutFilter,
  });

  const renderItem = ({ item }: { item: Entreprise }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/entreprises/${item.id}` as any)}
    >
      <View style={styles.cardTop}>
        {item.logo && (
          <Image
            source={{
              uri: item.logo.startsWith("http")
                ? item.logo
                : `${baseURL}${item.logo}`,
            }}
            style={styles.cardLogo}
          />
        )}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.nom} numberOfLines={2}>
              {item.nom}
            </Text>
            <View
              style={[
                styles.badge,
                item.statut === "client" && styles.badgeClient,
                item.statut === "prospect" && styles.badgeProspect,
                item.statut === "fournisseur" && styles.badgeFournisseur,
                item.statut === "a_reactiver" && styles.badgeReactiver,
              ]}
            >
              <Text style={styles.badgeText}>
                {item.statut === "a_reactiver" ? "à réactiver" : item.statut}
              </Text>
            </View>
          </View>
          {item.ville && (
            <Text style={styles.ville} numberOfLines={1}>
              {item.ville}
              {item.code_postal && ` (${item.code_postal})`}
            </Text>
          )}
        </View>
      </View>
      <View>
        {item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Erreur de chargement des entreprises
        </Text>
        <AppButton
          title="Reessayer"
          onPress={() => refetch()}
          size="sm"
          style={styles.retryButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher..."
        placeholderTextColor={Colors.light.muted}
        value={recherche}
        onChangeText={setRecherche}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        style={styles.filtersScroll}
      >
        <TouchableOpacity
          style={[styles.filterChip, !statutFilter && styles.filterChipActive]}
          onPress={() => setStatutFilter(undefined)}
        >
          <Text
            style={[
              styles.filterChipText,
              !statutFilter && styles.filterChipTextActive,
            ]}
          >
            Tous
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            statutFilter === "client" && styles.filterChipActive,
          ]}
          onPress={() => setStatutFilter("client")}
        >
          <Text
            style={[
              styles.filterChipText,
              statutFilter === "client" && styles.filterChipTextActive,
            ]}
          >
            Clients
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            statutFilter === "prospect" && styles.filterChipActive,
          ]}
          onPress={() => setStatutFilter("prospect")}
        >
          <Text
            style={[
              styles.filterChipText,
              statutFilter === "prospect" && styles.filterChipTextActive,
            ]}
          >
            Prospects
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            statutFilter === "fournisseur" && styles.filterChipActive,
          ]}
          onPress={() => setStatutFilter("fournisseur")}
        >
          <Text
            style={[
              styles.filterChipText,
              statutFilter === "fournisseur" && styles.filterChipTextActive,
            ]}
          >
            Fournisseurs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            statutFilter === "a_reactiver" && styles.filterChipActive,
          ]}
          onPress={() => setStatutFilter("a_reactiver")}
        >
          <Text
            style={[
              styles.filterChipText,
              statutFilter === "a_reactiver" && styles.filterChipTextActive,
            ]}
          >
            À réactiver
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {isLoading && !data ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
        </View>
      ) : (
        <FlatList
          data={data?.entreprises || []}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={Colors.light.tint}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucune entreprise trouvée</Text>
            </View>
          }
        />
      )}

      {/* Bouton flottant */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/entreprises/create" as any)}
      >
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1f2937",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  searchInput: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 14,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
    fontSize: 16,
    elevation: 1,
  },
  filtersScroll: {
    maxHeight: 50,
    flexGrow: 0,
  },
  filters: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterChipActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  filterChipText: {
    color: Colors.light.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "#0b1222",
  },
  list: {
    padding: 20,
    paddingTop: 0,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    elevation: 2,
    overflow: "hidden",
  },
  cardLogo: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  cardContent: {
    flex: 1,
  },
  nom: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.light.text,
    flex: 1,
    marginRight: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeClient: {
    backgroundColor: "#34d399",
  },
  badgeProspect: {
    backgroundColor: "#fbbf24",
  },
  badgeFournisseur: {
    backgroundColor: Colors.light.tint,
  },
  badgeReactiver: {
    backgroundColor: "#22d3ee",
  },
  badgeText: {
    color: "#0b1222",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  ville: {
    color: Colors.light.muted,
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  description: {
    color: Colors.light.text,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    color: Colors.light.muted,
    fontSize: 16,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
});
