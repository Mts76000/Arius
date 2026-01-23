import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { Colors } from "@/constants/theme";

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.light.tint} />
        ) : (
          <>
            <Text style={styles.infoText}>Non connecté</Text>
            <TouchableOpacity
              onPress={() => router.push("/login")}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Aller à la connexion</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Bienvenue {user.prenom || user.nom || user.email}
      </Text>
      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user.email}</Text>
        {user.prenom && (
          <>
            <Text style={styles.label}>Prénom</Text>
            <Text style={styles.value}>{user.prenom}</Text>
          </>
        )}
        {user.nom && (
          <>
            <Text style={styles.label}>Nom</Text>
            <Text style={styles.value}>{user.nom}</Text>
          </>
        )}
      </View>
      <TouchableOpacity onPress={handleLogout} style={styles.dangerButton}>
        <Text style={styles.dangerButtonText}>Déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8fafc", // clair
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 16,
    color: "#0f172a",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  label: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 8,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  value: {
    fontSize: 16,
    color: "#0f172a",
    fontWeight: "700",
    marginTop: 2,
  },
  primaryButton: {
    backgroundColor: "#0ea5e9",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  primaryButtonText: {
    color: "#0b1222",
    fontWeight: "800",
    fontSize: 16,
    textAlign: "center",
  },
  infoText: {
    fontSize: 18,
    marginBottom: 16,
    color: "#0f172a",
    textAlign: "center",
  },
  dangerButton: {
    marginTop: 24,
    backgroundColor: "#f87171",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  dangerButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
});
