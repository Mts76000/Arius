import React from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const painPoints = [
  {
    icon: "time-outline",
    title: "Trop de temps perdu",
    description: "Entrer un client ne devrait pas prendre cinq écrans.",
  },
  {
    icon: "laptop-outline",
    title: "Fait pour le bureau",
    description: "Vous en avez besoin dans la poche, entre deux rendez-vous.",
  },
  {
    icon: "server-outline",
    title: "Vos données ailleurs",
    description: "Exporter vos contacts devrait être simple, pas un parcours.",
  },
];

export function ProblemSection() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  return (
    <View className="w-full bg-white px-5 py-16">
      <View style={{ maxWidth: 1120, marginHorizontal: "auto" }}>
        <View
          style={{
            flexDirection: isDesktop ? "row" : "column",
            gap: isDesktop ? 80 : 32,
            alignItems: isDesktop ? "flex-start" : "flex-start",
          }}
        >
          <View className="flex-1">
            <Text
              className="text-ink"
              style={{
                fontSize: isDesktop ? 36 : 28,
                lineHeight: isDesktop ? 42 : 34,
                fontWeight: "700",
              }}
            >
              Les CRM traditionnels sont conçus pour des équipes en open space,
              pas pour un commercial sur le terrain.
            </Text>
          </View>

          <View className="flex-1 gap-6">
            {painPoints.map((point, index) => (
              <View key={point.title} className="flex-row gap-4">
                <View
                  className="h-10 w-10 items-center justify-center rounded-full bg-paper"
                  style={{ marginTop: 2 }}
                >
                  <Ionicons name={point.icon as any} size={20} color="#007aff" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text
                      className="text-sm font-bold text-slate-400"
                      style={{ minWidth: 24 }}
                    >
                      0{index + 1}
                    </Text>
                    <Text className="text-lg font-semibold text-ink">
                      {point.title}
                    </Text>
                  </View>
                  <Text className="mt-1 leading-6 text-warmGray">
                    {point.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
