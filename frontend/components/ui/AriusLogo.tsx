import React from "react";
import { Text, View } from "react-native";

interface AriusLogoProps {
  size?: number;
  showText?: boolean;
}

export function AriusLogo({ size = 40, showText = false }: AriusLogoProps) {
  const barWidth = Math.max(3, size * 0.11);
  const barRadius = Math.max(2, size * 0.04);

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
          style={{ fontSize: size * 0.58, lineHeight: size * 0.68 }}
        >
          A
        </Text>
        <View
          className="absolute bg-sky-100"
          style={{
            borderRadius: Math.max(2, size * 0.05),
            bottom: size * 0.27,
            height: Math.max(3, size * 0.08),
            right: size * 0.14,
            transform: [{ rotate: "-38deg" }],
            width: size * 0.35,
          }}
        />
        <View
          className="absolute bg-white"
          style={{
            borderRadius: barRadius,
            bottom: size * 0.2,
            height: size * 0.17,
            right: size * 0.25,
            width: barWidth,
          }}
        />
        <View
          className="absolute bg-white"
          style={{
            borderRadius: barRadius,
            bottom: size * 0.2,
            height: size * 0.24,
            right: size * 0.15,
            width: barWidth,
          }}
        />
        <View
          className="absolute bg-white"
          style={{
            borderRadius: barRadius,
            bottom: size * 0.2,
            height: size * 0.31,
            right: size * 0.05,
            width: barWidth,
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
