import React from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FinalCtaProps {
  onCtaPress: () => void;
}

export function FinalCta({ onCtaPress }: FinalCtaProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  return (
    <View className="w-full bg-cream px-5 py-16">
      <View
        className="items-center"
        style={{ maxWidth: 800, marginHorizontal: "auto" }}
      >
        <Text
          className="text-center text-ink"
          style={{
            fontSize: isDesktop ? 44 : 32,
            lineHeight: isDesktop ? 52 : 38,
            fontWeight: "700",
          }}
        >
          Prêt à ne plus perdre vos clients de vue ?
        </Text>
        <Text
          className="mt-4 text-center text-lg leading-8 text-warmGray"
          style={{ maxWidth: 560 }}
        >
          Commencez gratuitement. Pas de carte bancaire, pas de contrat. Et si
          un jour vous partez, vos données repartent avec vous.
        </Text>

        <View className="mt-8">
          <Pressable
            onPress={onCtaPress}
            accessibilityRole="button"
            className="h-14 flex-row items-center justify-center gap-2 rounded-xl bg-primary px-8"
          >
            <Text className="text-lg font-bold text-white">Créer mon compte</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
