import React from "react";
import { View, Text, Image } from "react-native";
import Constants from "expo-constants";
import { styles } from "@/styles/entrepriseDetailStyles";

const baseURL = Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:3000";

interface EntrepriseHeaderProps {
  entreprise: any;
}

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

export const EntrepriseHeader: React.FC<EntrepriseHeaderProps> = ({
  entreprise,
}) => {
  return (
    <>
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
    </>
  );
};
