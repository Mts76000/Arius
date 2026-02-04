import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { usePathname, useRouter, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Colors } from "@/constants/theme";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

interface UserData {
  id: string;
  email: string;
  prenom: string | null;
  nom: string | null;
}

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const token = useAuthStore((state) => state.token);

  // Ne faire la requête que si on a un token
  const { data: user, isLoading } = useQuery({
    queryKey: ["user", token],
    queryFn: async () => {
      const response = await api.get("/v1/auth/me");
      return response.data as UserData;
    },
    enabled: !!token, // N'exécute la requête que si token existe
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Pas de retry
  });

  const firstName = user?.prenom || "Utilisateur";
  const lastName = user?.nom || "";
  const initials = `${firstName?.charAt(0) || "U"}${
    lastName?.charAt(0) || "?"
  }`.toUpperCase();

  const handleAvatarPress = () => {
    router.push("/(tabs)/profil");
  };

  const handleBackPress = () => {
    router.back();
  };

  const getPageTitle = (path: string) => {
    if (path.includes("/profil")) return "Mon Profil";

    if (path.includes("/entreprises/edit/")) return "Modifier Entreprise";
    if (path.endsWith("/entreprises/create")) return "Nouvelle Entreprise";
    if (path.includes("/entreprises/") && !path.endsWith("/entreprises")) {
      return "Détail Entreprise";
    }
    if (path.includes("/entreprises")) return "Entreprises";

    if (path.includes("/rdvs")) return "Mes Rendez-vous";
    if (path.includes("/ca")) return "Chiffre d'affaires";

    if (path.includes("/home") || path === "/" || path.endsWith("/(tabs)")) {
      return "Accueil";
    }

    return "Accueil";
  };

  const pageTitle = getPageTitle(pathname);
  const shouldShowBack = segments.length > 2;

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {shouldShowBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color={Colors.light.text} />
          </TouchableOpacity>
        )}
        <Text style={styles.greeting}>{pageTitle}</Text>
      </View>

      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={handleAvatarPress}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.light.tint} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  leftSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.text,
  },
  avatarContainer: {
    marginLeft: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.light.tint,
  },
  initials: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
});
