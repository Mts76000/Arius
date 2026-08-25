import React from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { JournalCard } from "./JournalCard";

const steps = [
  {
    step: "01",
    icon: "person-add-outline" as const,
    title: "Ajoutez un client en quelques secondes",
    description:
      "Nom, ville, statut. Vous retrouvez tout dans une fiche claire avec contacts et historique.",
    accent: "#007aff",
  },
  {
    step: "02",
    icon: "calendar-outline" as const,
    title: "Planifiez vos rendez-vous",
    description:
      "Chaque RDV est lié à une entreprise et à un contact. Vous arrivez préparé.",
    accent: "#A855F7",
  },
  {
    step: "03",
    icon: "document-text-outline" as const,
    title: "Prenez des notes utiles",
    description:
      "Comptes-rendus d'appels, réunions, infos : tout est rangé au bon endroit.",
    accent: "#FF9502",
  },
  {
    step: "04",
    icon: "trending-up-outline" as const,
    title: "Suivez votre chiffre d'affaires",
    description:
      "Visualisez votre CA par client et par mois. Ajustez vos objectifs en temps réel.",
    accent: "#34C759",
  },
];

export function JourneySection() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  return (
    <View className="w-full bg-cream px-5 py-16">
      <View style={{ maxWidth: 1120, marginHorizontal: "auto" }}>
        <View className="mb-12">
          <Text className="text-sm font-bold uppercase tracking-widest text-slate-400">
            Le parcours
          </Text>
          <Text
            className="mt-2 text-ink"
            style={{
              fontSize: isDesktop ? 40 : 28,
              lineHeight: isDesktop ? 46 : 34,
              fontWeight: "700",
            }}
          >
            Une journée avec Arius
          </Text>
        </View>

        <View
          className="gap-5"
          style={{
            flexDirection: isDesktop ? "row" : "column",
            flexWrap: isDesktop ? "wrap" : "nowrap",
          }}
        >
          {steps.map((s) => (
            <View
              key={s.step}
              className="h-full"
              style={{
                flex: 1,
                minWidth: isDesktop ? 240 : undefined,
                minHeight: 260,
              }}
            >
              <JournalCard
                step={s.step}
                icon={s.icon}
                title={s.title}
                description={s.description}
                accent={s.accent}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
