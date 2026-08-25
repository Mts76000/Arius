import React from "react";
import { Pressable, Text, View } from "react-native";
import { AriusLogo } from "@/components/ui/AriusLogo";

interface LandingHeaderProps {
  onCtaPress: () => void;
}

export function LandingHeader({ onCtaPress }: LandingHeaderProps) {
  return (
    <View className="w-full border-b border-slate-100/80 bg-cream px-5 py-4">
      <View
        className="w-full flex-row items-center justify-between"
        style={{ maxWidth: 1120, marginHorizontal: "auto" }}
      >
        <AriusLogo size={40} showText />

        <Pressable
          onPress={onCtaPress}
          accessibilityRole="button"
          className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 shadow-sm"
        >
          <Text className="font-semibold text-ink">Se connecter</Text>
        </Pressable>
      </View>
    </View>
  );
}
