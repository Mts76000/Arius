import React, { useMemo } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/authStore";
import { useMyRdvs } from "@/hooks/useRdvs";
import { useEntreprises } from "@/hooks/useEntreprises";
import { AppButton } from "@/components/ui/AppButton";

const palette = {
  primary: "#0ea5e9",
  background: "#f8fafc",
  card: "#ffffff",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
};

export default function HomeScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  const today = useMemo(() => new Date(), []);
  const startDate = useMemo(() => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    return date;
  }, [today]);
  const endDate = useMemo(() => {
    const date = new Date(today);
    date.setDate(date.getDate() + 7);
    date.setHours(23, 59, 59, 999);
    return date;
  }, [today]);

  const rdvFilters = useMemo(
    () => ({
      de: startDate.toISOString(),
      a: endDate.toISOString(),
      limite: 10,
    }),
    [startDate, endDate],
  );

  const {
    data: rdvsData,
    isLoading: isLoadingRdvs,
    refetch: refetchRdvs,
  } = useMyRdvs(rdvFilters);

  const entrepriseFilters = useMemo(
    () => ({ statut: "a_reactiver" as const, limite: 5 }),
    [],
  );
  const {
    data: reactiverData,
    isLoading: isLoadingReactiver,
    refetch: refetchReactiver,
  } = useEntreprises(entrepriseFilters);

  const refreshing = isLoadingRdvs || isLoadingReactiver;

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(today);
  }, [today]);

  const greetingName = user?.prenom || user?.nom || "Utilisateur";

  const rdvs = rdvsData?.rdvs || [];
  const upcomingRdvs = [...rdvs]
    .filter((rdv) => new Date(rdv.date_prevue) >= new Date())
    .sort(
      (a, b) =>
        new Date(a.date_prevue).getTime() - new Date(b.date_prevue).getTime(),
    )
    .slice(0, 3);

  const aReactiver = reactiverData?.entreprises || [];

  const formatShortDate = (value: string) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  };

  if (!user) {
    return (
      <View>
        {isLoading ? (
          <ActivityIndicator size="large" color={palette.primary} />
        ) : (
          <>
            <Text>Non connecté</Text>
            <AppButton
              title="Aller a la connexion"
              onPress={() => router.push("/login")}
            />
          </>
        )}
      </View>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            refetchRdvs();
            refetchReactiver();
          }}
          tintColor={palette.primary}
        />
      }
    >
      <Text>{formattedDate}</Text>
      <Text>Bonjour {greetingName} 👋</Text>

      <View>
        <Text>Actions rapides</Text>
      </View>
      <View>
        <TouchableOpacity onPress={() => router.push("/entreprises/create")}>
          <View>
            <Ionicons name="person-add" size={22} color="#2563eb" />
          </View>
          <Text>Nouvelle entreprise</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/entreprises")}>
          <View>
            <Ionicons name="briefcase" size={22} color="#2563eb" />
          </View>
          <Text>Toutes les entreprises</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/rdvs")}>
          <View>
            <Ionicons name="calendar" size={22} color="#7c3aed" />
          </View>
          <Text>Rendez-vous</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/ca")}>
          <View>
            <Ionicons name="trending-up" size={22} color="#10b981" />
          </View>
          <Text>Objectifs CA</Text>
        </TouchableOpacity>
      </View>

      <View>
        <Text>À surveiller</Text>
      </View>
      <View>
        <View>
          <Text>Prochains RDV (7 jours)</Text>
          {isLoadingRdvs && <ActivityIndicator size="small" />}
        </View>
        {upcomingRdvs.length === 0 ? (
          <Text>Aucun RDV planifié</Text>
        ) : (
          upcomingRdvs.map((rdv) => (
            <View key={rdv._id}>
              <View>
                <Text>{rdv.titre}</Text>
                <Text>{formatShortDate(rdv.date_prevue)}</Text>
              </View>
              <View>
                <Text>{rdv.statut}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View>
        <View>
          <Text>Entreprises à réactiver</Text>
          {isLoadingReactiver && <ActivityIndicator size="small" />}
        </View>
        {aReactiver.length === 0 ? (
          <Text>Rien à relancer pour l’instant</Text>
        ) : (
          aReactiver.slice(0, 3).map((entreprise) => (
            <View key={entreprise.id}>
              <View>
                <Text>{entreprise.nom}</Text>
                <Text>À réactiver</Text>
              </View>
              <Ionicons name="alert-circle" size={18} color="#f59e0b" />
            </View>
          ))
        )}
        <AppButton
          title="Voir toutes les entreprises"
          onPress={() => router.push("/entreprises")}
          variant="link"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: palette.background,
  },
  dateText: {
    fontSize: 13,
    color: palette.muted,
    textTransform: "capitalize",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 16,
    color: palette.text,
  },
  primaryButton: {
    marginTop: 12,
  },
  infoText: {
    fontSize: 18,
    marginBottom: 16,
    color: palette.text,
    textAlign: "center",
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.text,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActionCard: {
    width: "48%",
    backgroundColor: palette.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  quickActionPrimary: {
    borderColor: "#bfdbfe",
    backgroundColor: "#eff6ff",
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(37, 99, 235, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "700",
    color: palette.text,
  },
  infoCard: {
    backgroundColor: palette.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: 16,
  },
  infoCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.text,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  listItemMain: {
    flex: 1,
    marginRight: 8,
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: palette.text,
  },
  listItemSubtitle: {
    fontSize: 12,
    color: palette.muted,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "#ede9fe",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7c3aed",
    textTransform: "capitalize",
  },
  emptyText: {
    fontSize: 13,
    color: palette.muted,
    paddingVertical: 8,
  },
  linkButton: {
    marginTop: 12,
    alignSelf: "flex-start",
  },
});
