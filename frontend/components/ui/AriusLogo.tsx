import React from "react";
import { Text, View } from "react-native";

interface AriusLogoProps {
  size?: number;
  showText?: boolean;
}

export function AriusLogo({ size = 40, showText = false }: AriusLogoProps) {
  return (
    <View className="flex-row items-center gap-3">
      <View
        className="items-center justify-center overflow-hidden rounded-xl bg-primary"
        style={{ height: size, width: size }}
      >
        <View
          className="absolute rounded-full bg-white/20"
          style={{
            height: size * 0.86,
            right: -size * 0.24,
            top: -size * 0.24,
            width: size * 0.86,
          }}
        />
        <Text
          className="font-bold text-white"
          style={{ fontSize: size * 0.52, lineHeight: size * 0.62 }}
        >
          A
        </Text>
        <View
          className="absolute rounded-full bg-white"
          style={{
            bottom: size * 0.22,
            height: Math.max(3, size * 0.09),
            right: size * 0.22,
            width: size * 0.34,
          }}
        />
      </View>

      {showText && (
        <View>
          <Text className="text-lg font-bold text-slate-950">Arius</Text>
          <Text className="text-xs text-slate-500">CRM commercial</Text>
        </View>
      )}
    </View>
  );
}
