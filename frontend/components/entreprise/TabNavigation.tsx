import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export type TabType = "infos" | "rdv" | "devis" | "notes" | "chiffres";

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { key: "infos" as TabType, label: "Infos" },
    { key: "rdv" as TabType, label: "RDV" },
    { key: "devis" as TabType, label: "Devis" },
    { key: "notes" as TabType, label: "Notes" },
    { key: "chiffres" as TabType, label: "Chiffres" },
  ];

  return (
    <View className="flex-row justify-between border-b border-slate-200 px-5 pb-2 pt-4">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            className="items-center"
          >
            <Text
              className={`text-base font-semibold ${
                isActive ? "text-primary" : "text-slate-500"
              }`}
            >
              {tab.label}
            </Text>
            <View
              className={`mt-2 h-0.5 w-10 rounded-full ${
                isActive ? "bg-primary" : "bg-transparent"
              }`}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
