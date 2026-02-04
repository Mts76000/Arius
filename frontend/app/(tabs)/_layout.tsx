import { Tabs, Redirect, useRouter, usePathname } from "expo-router";
import React from "react";
import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";

export default function TabsLayout() {
  const token = useAuthStore((state) => state.token);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const router = useRouter();
  const pathname = usePathname();

  if (!isInitialized) {
    return null;
  }

  if (!token) {
    return <Redirect href="/login" />;
  }

  const handleEntreprisesPress = () => {
    // Si on est déjà dans la section entreprises mais pas sur la page liste
    if (
      pathname.includes("/entreprises") &&
      pathname !== "/(tabs)/entreprises"
    ) {
      router.replace("/(tabs)/entreprises");
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: Colors.light.card,
        },
        headerTintColor: Colors.light.text,
        tabBarActiveTintColor: Colors.light.tint,
        tabBarInactiveTintColor: Colors.light.muted,
        tabBarStyle: {
          backgroundColor: Colors.light.card,
          borderTopWidth: 1,
          borderTopColor: Colors.light.border,
          paddingBottom: 10,
          paddingTop: 10,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          textTransform: "uppercase",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Accueil",
          headerTitle: "Accueil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="entreprises"
        options={{
          title: "Entreprises",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            const isOnEntreprisesList = pathname === "/(tabs)/entreprises";

            // Toujours forcer la navigation vers la liste sans empiler
            if (!isOnEntreprisesList) {
              e.preventDefault();
              router.replace("/(tabs)/entreprises");
            }
            // Si on est déjà sur la liste, laisser le comportement par défaut (pas de navigation)
          },
        }}
      />
      <Tabs.Screen
        name="rdvs"
        options={{
          title: "RDVs",
          headerTitle: "Mes Rendez-vous",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ca"
        options={{
          title: "CA",
          headerTitle: "Chiffre d'affaires",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: "Mon Profil",
          href: null,
        }}
      />
    </Tabs>
  );
}
