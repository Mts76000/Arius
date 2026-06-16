import React from "react";
import { ScrollView, Text, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const sections = [
  {
    title: "Finalités du traitement",
    items: [
      "Créer et sécuriser le compte utilisateur.",
      "Gérer les entreprises, contacts, rendez-vous, notes, devis, objectifs et chiffre d'affaires.",
      "Permettre l'export des données et la suppression/anonymisation du compte.",
    ],
  },
  {
    title: "Données traitées",
    items: [
      "Identité du compte : email, prénom, nom et mot de passe hashé.",
      "Données CRM : entreprises, contacts, notes, rendez-vous, devis, objectifs et CA.",
      "Fichiers transmis : logos d'entreprises et devis associés.",
    ],
  },
  {
    title: "Durée de conservation",
    items: [
      "Les données sont conservées tant que le compte est actif.",
      "Lors d'une suppression, les données CRM sont effacées et le compte est anonymisé.",
      "Les tokens de réinitialisation expirent automatiquement et ne sont utilisables qu'une seule fois.",
    ],
  },
  {
    title: "Droits utilisateur",
    items: [
      "Droit d'accès via l'export complet ou par catégorie.",
      "Droit de rectification depuis le profil et les écrans métier.",
      "Droit à l'effacement via la suppression du compte.",
    ],
  },
  {
    title: "Sécurité",
    items: [
      "Authentification JWT et séparation des données par utilisateur.",
      "Mots de passe hashés, tokens de reset hashés et rate limit sur les demandes sensibles.",
      "Upload limité en taille, type MIME et extension.",
    ],
  },
  {
    title: "Contact",
    items: [
      "Pour toute demande sur les données personnelles, contactez l'administrateur du projet.",
      "lamottemathis@gmail.com",
    ],
  },
];

export default function PrivacyScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 700;

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{
        alignSelf: "center",
        maxWidth: 920,
        paddingBottom: isDesktop ? 56 : 190,
        paddingHorizontal: isDesktop ? 32 : 20,
        paddingTop: 24,
        width: "100%",
      }}
    >
      <View className="gap-6">
        <View className="rounded-3xl bg-white p-6 shadow-base">
          <View className="flex-row items-start gap-4">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primaryLight">
              <Ionicons name="shield-checkmark-outline" size={24} color="#007aff" />
            </View>
            <View className="flex-1 gap-2">
              <Text className="text-lg font-semibold text-slate-900">
                Politique de confidentialité
              </Text>
              <Text className="text-sm leading-6 text-gray">
                Arius traite uniquement les données nécessaires au fonctionnement du
                CRM. Cette page résume les informations utiles pour comprendre les
                traitements, les durées de conservation et les droits disponibles dans{" "}
                {"l'application"}.
              </Text>
            </View>
          </View>
        </View>

        {sections.map((section) => (
          <View
            key={section.title}
            className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <Text className="text-base font-semibold text-slate-900">
              {section.title}
            </Text>
            <View className="mt-3 gap-3">
              {section.items.map((item) => (
                <View key={item} className="flex-row items-start gap-3">
                  <View className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                  <Text className="flex-1 text-sm leading-6 text-gray">{item}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
