import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EntrepriseAvatar } from "@/components/ui/EntrepriseAvatar";

interface EntrepriseHeaderProps {
  entreprise: any;
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
  const [showActions, setShowActions] = useState(false);

  const handleEdit = () => {
    setShowActions(false);
    onEdit();
  };

  const handleDelete = () => {
    setShowActions(false);
    onDelete();
  };

  return (
    <>
      {/* Header */}
      <View className="relative border-b border-slate-200 px-5 pb-4 pt-5">
        <TouchableOpacity
          className="absolute right-5 top-5 h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white"
          onPress={() => setShowActions((prev) => !prev)}
        >
          <Ionicons name="ellipsis-vertical" size={18} color="#64748B" />
        </TouchableOpacity>

        {showActions ? (
          <View className="absolute right-5 top-16 z-10 min-w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-base">
            <TouchableOpacity
              className="flex-row items-center gap-2 rounded-xl px-3 py-2"
              onPress={handleEdit}
            >
              <Ionicons name="pencil-outline" size={18} color="#3B82F6" />
              <Text className="text-base font-medium text-slate-700">
                Modifier
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center gap-2 rounded-xl px-3 py-2"
              onPress={handleDelete}
              disabled={isDeleting}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text className="text-base font-medium text-red-500">
                {isDeleting ? "Suppression..." : "Supprimer"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

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
