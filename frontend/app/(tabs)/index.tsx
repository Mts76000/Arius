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
          <ActivityIndicator size="large" color="#2563eb" />
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
    backgroundColor: "#f5f7fb",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fb",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    color: "#0f172a",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#1e293b",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  label: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    color: "#0f172a",
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  infoText: {
    fontSize: 18,
    marginBottom: 16,
    color: "#0f172a",
    textAlign: "center",
  },
  dangerButton: {
    marginTop: 24,
    backgroundColor: "#dc2626",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  dangerButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
