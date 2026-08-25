import React from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const exportItems = [
  {
    label: "Prospects",
    description: "Entreprises, contacts et statuts.",
    icon: "people-outline",
    color: "#007aff",
  },
  {
    label: "Rendez-vous",
    description: "Historique complet de vos échanges.",
    icon: "calendar-outline",
    color: "#A855F7",
  },
  {
    label: "Notes",
    description: "Comptes-rendus et informations.",
    icon: "document-text-outline",
    color: "#FF9502",
  },
  {
    label: "Chiffre d'affaires",
    description: "CA par entreprise et par mois.",
    icon: "trending-up-outline",
    color: "#34C759",
  },
];

export function ExportSection() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  return (
    <View className="w-full bg-paper px-5 py-16">
      <View style={{ maxWidth: 1120, marginHorizontal: "auto" }}>
        <View
          style={{
            flexDirection: isDesktop ? "row" : "column",
            gap: isDesktop ? 64 : 32,
            alignItems: isDesktop ? "center" : "flex-start",
          }}
        >
          <View className="flex-1">
            <Text className="text-sm font-bold uppercase tracking-widest text-slate-400">
              Vos données
            </Text>
            <Text
              className="mt-2 text-ink"
              style={{
                fontSize: isDesktop ? 36 : 28,
                lineHeight: isDesktop ? 42 : 34,
                fontWeight: "700",
              }}
            >
              Vous gardez la main sur votre carnet.
            </Text>
            <Text
              className="mt-4 text-lg leading-8 text-warmGray"
              style={{ maxWidth: 460 }}
            >
              Arius ne retient pas vos informations en otage. À tout moment,
              exportez vos prospects, rendez-vous, notes et chiffre
              d&apos;affaires dans un fichier Excel ou un ZIP.
            </Text>
          </View>

          <View
            className="rounded-2xl border border-slate-200/50 bg-white p-6 shadow-soft"
            style={{
              flex: 1,
              width: "100%",
              shadowColor: "#111827",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.04,
              shadowRadius: 24,
              elevation: 4,
            }}
          >
            <View className="mb-4 flex-row items-center gap-2">
              <View className="h-2 w-2 rounded-full bg-slate-400" />
              <Text className="text-xs font-bold uppercase tracking-widest text-warmGray">
                Export disponible
              </Text>
            </View>

            <View className="gap-2">
              {exportItems.map((item, index) => (
                <View
                  key={item.label}
                  className={`flex-row items-start gap-3 py-3 ${
                    index !== exportItems.length - 1 ? "border-b border-slate-200/50" : ""
                  }`}
                >
                  <View
                    className="mt-0.5 h-9 w-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <Ionicons name={item.icon as any} size={18} color={item.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-ink">
                      {item.label}
                    </Text>
                    <Text className="text-sm text-warmGray">
                      {item.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
