import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Devis, devisService } from "@/services/devis";
import { ActionMenu } from "@/components/ui/ActionMenu";

type Props = {
  devis: Devis;
  onView: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
};

export function DevisCard({
  devis,
  onView,
  onDelete,
  isDeleting = false,
}: Props) {
  const createdAt = new Date(devis.createdAt).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <View className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 flex-row items-start gap-3">
          <View className="flex-1 gap-1">
            <Text
              className="text-base font-bold text-slate-900 capitalize"
              numberOfLines={1}
            >
              {devis.nom}
            </Text>
            <Text className="text-sm text-slate-500" numberOfLines={1}>
              {devis.nom_fichier}
            </Text>
          </View>
        </View>

        <ActionMenu
          items={[
            {
              key: "open",
              label: "Ouvrir",
              icon: "eye-outline",
              iconColor: "#3B82F6",
              onPress: onView,
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

      <View className="mt-3 flex-row items-center gap-2">
        <Ionicons name="folder-open-outline" size={15} color="#64748b" />
        <Text className="text-sm text-slate-600">
          {devisService.formatFileSize(devis.taille_octets)}
        </Text>
        <Text className="text-slate-300">•</Text>
        <Ionicons name="calendar-outline" size={15} color="#64748b" />
        <Text className="text-sm text-slate-600">{createdAt}</Text>
      </View>

      {devis.notes ? (
        <View className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Notes
          </Text>
          <Text className="mt-1 text-sm text-slate-700" numberOfLines={3}>
            {devis.notes}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
