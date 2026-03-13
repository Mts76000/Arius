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
    <View
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => onTabChange(tab.key)}
        >
          <Text
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
