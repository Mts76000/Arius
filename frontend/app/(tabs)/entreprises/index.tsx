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

import { AppButton } from "@/components/ui/AppButton";
import { BtnPlus } from "@/components/ui/BtnPlus";

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
      onPress={() => router.push(`/entreprises/${item.id}` as any)}
    >
      <View>
        {item.logo && (
          <Image
            source={{
              uri: item.logo.startsWith("http")
                ? item.logo
                : `${baseURL}${item.logo}`,
            }}
          />
        )}
        <View>
          <View>
            <Text numberOfLines={2}>{item.nom}</Text>
            <View>
              <Text>
                {item.statut === "a_reactiver" ? "à réactiver" : item.statut}
              </Text>
            </View>
          </View>
          {item.ville && (
            <Text numberOfLines={1}>
              {item.ville}
              {item.code_postal && ` (${item.code_postal})`}
            </Text>
          )}
        </View>
      </View>
      <View>
        {item.description && <Text numberOfLines={2}>{item.description}</Text>}
      </View>
    </TouchableOpacity>
  );

  if (error) {
    return (
      <View>
        <Text>Erreur de chargement des entreprises</Text>
        <AppButton title="Reessayer" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <View>
      <TextInput
        placeholder="Rechercher..."
        placeholderTextColor={"#64748b"}
        value={recherche}
        onChangeText={setRecherche}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity onPress={() => setStatutFilter(undefined)}>
          <Text>Tous</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setStatutFilter("client")}>
          <Text>Clients</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setStatutFilter("prospect")}>
          <Text>Prospects</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setStatutFilter("fournisseur")}>
          <Text>Fournisseurs</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setStatutFilter("a_reactiver")}>
          <Text>À réactiver</Text>
        </TouchableOpacity>
      </ScrollView>

      {isLoading && !data ? (
        <View>
          <ActivityIndicator size="large" color={"#0ea5e9"} />
        </View>
      ) : (
        <FlatList
          data={data?.entreprises || []}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={"#0ea5e9"}
            />
          }
          ListEmptyComponent={
            <View>
              <Text>Aucune entreprise trouvée</Text>
            </View>
          }
        />
      )}

      <BtnPlus
        formType="entreprise"
        onOpenEntreprise={() => router.push("/entreprises/create" as any)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
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
    backgroundColor: "#0ea5e9",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  searchInput: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    color: "#0f172a",
    borderWidth: 1,
    borderColor: "#e2e8f0",
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
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  filterChipActive: {
    backgroundColor: "#0ea5e9",
    borderColor: "#0ea5e9",
  },
  filterChipText: {
    color: "#64748b",
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
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 2,
    overflow: "hidden",
  },
  cardLogo: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
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
    color: "#0f172a",
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
    backgroundColor: "#0ea5e9",
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
    color: "#64748b",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  description: {
    color: "#0f172a",
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#64748b",
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
