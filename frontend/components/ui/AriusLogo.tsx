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
        className="items-center justify-center rounded-xl bg-primary"
        style={{ height: size, width: size }}
      >
        <Text
          className="font-bold text-white"
          style={{ fontSize: size * 0.6, lineHeight: size * 0.68 }}
        >
          A
        </Text>
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
