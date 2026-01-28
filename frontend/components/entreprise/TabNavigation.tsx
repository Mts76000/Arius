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
      style={{
        flexDirection: "row",
        backgroundColor: "#f8fafc",
        paddingHorizontal: 16,
        paddingTop: 12,
        gap: 8,
      }}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => onTabChange(tab.key)}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderBottomWidth: 3,
            borderBottomColor:
              activeTab === tab.key ? "#0ea5e9" : "transparent",
          }}
        >
          <Text
            style={{
              fontWeight: activeTab === tab.key ? "800" : "600",
              color: activeTab === tab.key ? "#0ea5e9" : "#64748b",
              fontSize: 15,
            }}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
