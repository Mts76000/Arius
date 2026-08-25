import React from "react";
import { Text, View } from "react-native";

interface LegalSectionProps {
  title: string;
  children: React.ReactNode;
  level?: 2 | 3;
}

export function LegalSection({ title, children, level = 2 }: LegalSectionProps) {
  return (
    <View className="border-b border-slate-200 pb-6 last:border-b-0">
      <Text
        accessibilityRole="header"
        aria-level={level}
        className="text-base font-semibold text-ink"
      >
        {title}
      </Text>
      <View className="mt-3 gap-3">{children}</View>
    </View>
  );
}

interface LegalParagraphProps {
  children: React.ReactNode;
}

export function LegalParagraph({ children }: LegalParagraphProps) {
  return <Text className="text-sm leading-6 text-warmGray">{children}</Text>;
}

interface LegalListProps {
  items: string[];
}

export function LegalList({ items }: LegalListProps) {
  return (
    <View className="gap-2">
      {items.map((item) => (
        <View key={item} className="flex-row items-start gap-2">
          <View className="mt-3 h-1.5 w-1.5 rounded-full bg-primary" />
          <Text className="flex-1 text-sm leading-6 text-warmGray">{item}</Text>
        </View>
      ))}
    </View>
  );
}
