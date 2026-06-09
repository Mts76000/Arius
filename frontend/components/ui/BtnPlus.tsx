import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type BtnPlusFormType = "rdv" | "ca" | "entreprise" | "custom";

interface BtnPlusProps {
  formType?: BtnPlusFormType;
  onOpenRdv?: () => void;
  onOpenCA?: () => void;
  onOpenEntreprise?: () => void;
  onPress?: () => void;
  bottom?: number;
  right?: number;
}

export function BtnPlus({
  formType = "custom",
  onOpenRdv,
  onOpenCA,
  onOpenEntreprise,
  onPress,
  bottom = 108,
  right = 20,
}: BtnPlusProps) {
  const handlePress = () => {
    if (formType === "rdv" && onOpenRdv) {
      onOpenRdv();
      return;
    }

    if (formType === "ca" && onOpenCA) {
      onOpenCA();
      return;
    }

    if (formType === "entreprise" && onOpenEntreprise) {
      onOpenEntreprise();
      return;
    }

    onPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Ajouter"
      className="absolute z-50 h-[55px] w-[55px] items-center justify-center rounded-full bg-primary shadow-lg"
      style={{ bottom, right }}
    >
      <Ionicons name="add-outline" size={40} color="#ffffff" />
    </TouchableOpacity>
  );
}
