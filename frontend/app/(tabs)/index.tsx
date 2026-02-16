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
import { Colors } from "@/constants/theme";
import { useMyRdvs } from "@/hooks/useRdvs";
import { useEntreprises } from "@/hooks/useEntreprises";
import { AppButton } from "@/components/ui/AppButton";

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
      <View style={styles.centered}>
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.light.tint} />
        ) : (
          <>
            <Text style={styles.infoText}>Non connecté</Text>
            <AppButton
              title="Aller a la connexion"
              onPress={() => router.push("/login")}
              style={styles.primaryButton}
            />
          </>
        )}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            refetchRdvs();
            refetchReactiver();
          }}
          tintColor={Colors.light.tint}
        />
      }
    >
      <Text style={styles.dateText}>{formattedDate}</Text>
      <Text style={styles.title}>Bonjour {greetingName} 👋</Text>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
      </View>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={[styles.quickActionCard, styles.quickActionPrimary]}
          onPress={() => router.push("/entreprises/create")}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="person-add" size={22} color="#2563eb" />
          </View>
          <Text style={styles.quickActionText}>Nouvelle entreprise</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push("/entreprises")}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="briefcase" size={22} color="#2563eb" />
          </View>
          <Text style={styles.quickActionText}>Toutes les entreprises</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push("/rdvs")}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="calendar" size={22} color="#7c3aed" />
          </View>
          <Text style={styles.quickActionText}>Rendez-vous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push("/ca")}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="trending-up" size={22} color="#10b981" />
          </View>
          <Text style={styles.quickActionText}>Objectifs CA</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>À surveiller</Text>
      </View>
      <View style={styles.infoCard}>
        <View style={styles.infoCardHeader}>
          <Text style={styles.infoCardTitle}>Prochains RDV (7 jours)</Text>
          {isLoadingRdvs && <ActivityIndicator size="small" />}
        </View>
        {upcomingRdvs.length === 0 ? (
          <Text style={styles.emptyText}>Aucun RDV planifié</Text>
        ) : (
          upcomingRdvs.map((rdv) => (
            <View key={rdv._id} style={styles.listItem}>
              <View style={styles.listItemMain}>
                <Text style={styles.listItemTitle}>{rdv.titre}</Text>
                <Text style={styles.listItemSubtitle}>
                  {formatShortDate(rdv.date_prevue)}
                </Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{rdv.statut}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoCardHeader}>
          <Text style={styles.infoCardTitle}>Entreprises à réactiver</Text>
          {isLoadingReactiver && <ActivityIndicator size="small" />}
        </View>
        {aReactiver.length === 0 ? (
          <Text style={styles.emptyText}>Rien à relancer pour l’instant</Text>
        ) : (
          aReactiver.slice(0, 3).map((entreprise) => (
            <View key={entreprise.id} style={styles.listItem}>
              <View style={styles.listItemMain}>
                <Text style={styles.listItemTitle}>{entreprise.nom}</Text>
                <Text style={styles.listItemSubtitle}>À réactiver</Text>
              </View>
              <Ionicons name="alert-circle" size={18} color="#f59e0b" />
            </View>
          ))
        )}
        <AppButton
          title="Voir toutes les entreprises"
          onPress={() => router.push("/entreprises")}
          variant="link"
          style={styles.linkButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
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
    backgroundColor: Colors.light.background,
  },
  dateText: {
    fontSize: 13,
    color: Colors.light.muted,
    textTransform: "capitalize",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 16,
    color: Colors.light.text,
  },
  primaryButton: {
    marginTop: 12,
  },
  infoText: {
    fontSize: 18,
    marginBottom: 16,
    color: Colors.light.text,
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
    color: Colors.light.text,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActionCard: {
    width: "48%",
    backgroundColor: Colors.light.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
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
    color: Colors.light.text,
  },
  infoCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
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
    color: Colors.light.text,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  listItemMain: {
    flex: 1,
    marginRight: 8,
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.text,
  },
  listItemSubtitle: {
    fontSize: 12,
    color: Colors.light.muted,
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
    color: Colors.light.muted,
    paddingVertical: 8,
  },
  linkButton: {
    marginTop: 12,
    alignSelf: "flex-start",
  },
  linkButton: {
    marginTop: 12,
    alignSelf: "flex-start",
  },
});
