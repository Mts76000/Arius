import React from "react";
import { View, Text } from "react-native";
import { EntrepriseAvatar } from "@/components/ui/EntrepriseAvatar";
import { ActionMenu } from "@/components/ui/ActionMenu";
import type { Entreprise } from "@/services/entreprises";

interface EntrepriseHeaderProps {
  entreprise: Entreprise;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

const getStatutLabel = (statut: string) => {
  return statut === "a_reactiver" ? "À réactiver" : statut;
};

const getStatutStyle = (statut: string) => {
  switch (statut) {
    case "client":
      return "bg-greenMedium";
    case "prospect":
      return "bg-primary";
    case "fournisseur":
      return "bg-purple";
    case "a_reactiver":
      return "bg-orange";
    default:
      return "bg-greenMedium";
  }
};

const getStatutTextStyle = (statut: string) => {
  switch (statut) {
    case "client":
      return "text-green";
    case "prospect":
      return "text-white";
    case "fournisseur":
      return "text-white";
    case "a_reactiver":
      return "text-white";
    default:
      return "text-green";
  }
};

export const EntrepriseHeader: React.FC<EntrepriseHeaderProps> = ({
  entreprise,
  onEdit,
  onDelete,
  isDeleting = false,
}) => {
  return (
    <>
      {/* Header */}
      <View className="relative border-b border-slate-200 px-5 pb-4 pt-5">
        <View className="absolute right-5 top-5 z-10">
          <ActionMenu
            menuClassName="min-w-44"
            buttonClassName="h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white"
            items={[
              {
                key: "edit",
                label: "Modifier",
                icon: "pencil-outline",
                iconColor: "#3B82F6",
                onPress: onEdit,
              },
              {
                key: "delete",
                label: isDeleting ? "Suppression..." : "Supprimer",
                icon: "trash-outline",
                iconColor: "#EF4444",
                textClassName: "text-red-500",
                disabled: isDeleting,
                onPress: onDelete,
              },
            ]}
          />
        </View>

        {/* Logo */}
        <View className="items-center py-4">
          <EntrepriseAvatar
            name={entreprise.nom}
            logo={entreprise.logo}
            size={75}
            rounded="xl"
          />

          <View
            className={`-mt-2 self-center rounded-full px-3.5 py-1.5 ${getStatutStyle(entreprise.statut)}`}
          >
            <Text
              className={`text-m font-bold capitalize ${getStatutTextStyle(entreprise.statut)}`}
            >
              {getStatutLabel(entreprise.statut)}
            </Text>
          </View>
        </View>

        <View className="flex flex-col gap-2 justify-center items-center">
          <Text className="text-3xl  font-bold capitalize " numberOfLines={2}>
            {entreprise.nom}
          </Text>
          {entreprise.description ? (
            <Text className="w-1/2 text-lg capitalize text-center font-medium text-gray">
              {entreprise.description}
            </Text>
          ) : null}
        </View>
      </View>
    </>
  );
};
