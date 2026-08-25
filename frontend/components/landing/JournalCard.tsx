import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface JournalCardProps {
  step: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  accent?: string;
}

export function JournalCard({
  step,
  icon,
  title,
  description,
  accent = "#007aff",
}: JournalCardProps) {
  return (
    <View
      className="h-full justify-center rounded-2xl border border-slate-200 bg-paper p-5 shadow-soft"
      style={{
        shadowColor: "#111827",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.04,
        shadowRadius: 24,
        elevation: 4,
      }}
    >
      <View className="mb-4 flex-row items-center justify-between">
        <View
          className="h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accent}15` }}
        >
          <Ionicons name={icon} size={20} color={accent} />
        </View>
        <Text className="text-3xl font-bold text-slate-300">{step}</Text>
      </View>
      <Text className="text-xl font-semibold text-ink">{title}</Text>
      <Text className="mt-2 leading-6 text-warmGray">{description}</Text>
    </View>
  );
}
