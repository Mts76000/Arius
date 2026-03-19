import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Devis, devisService } from "@/services/devis";

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
  const [showActions, setShowActions] = useState(false);

  const createdAt = new Date(devis.createdAt).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <View className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 flex-row items-start gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-full border border-primary/25 bg-primary/15">
            <Ionicons name="document-text-outline" size={20} color="#0ea5e9" />
          </View>

          <View className="flex-1 gap-1">
            <Text
              className="text-base font-bold text-slate-900"
              numberOfLines={1}
            >
              {devis.nom}
            </Text>
            <Text className="text-sm text-slate-500" numberOfLines={1}>
              {devis.nom_fichier}
            </Text>
          </View>
        </View>

        <View className="relative">
          <TouchableOpacity
            onPress={() => setShowActions((prev) => !prev)}
            className="h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white"
          >
            <Ionicons name="ellipsis-vertical" size={16} color="#64748B" />
          </TouchableOpacity>

          {showActions ? (
            <View className="absolute right-0 top-11 z-10 min-w-36 rounded-2xl border border-slate-200 bg-white p-2 shadow-base">
              <TouchableOpacity
                className="flex-row items-center gap-2 rounded-xl px-3 py-2"
                onPress={() => {
                  setShowActions(false);
                  onView();
                }}
              >
                <Ionicons name="eye-outline" size={16} color="#3B82F6" />
                <Text className="text-sm font-medium text-slate-700">
                  Ouvrir
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center gap-2 rounded-xl px-3 py-2"
                onPress={() => {
                  setShowActions(false);
                  onDelete();
                }}
                disabled={isDeleting}
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                <Text className="text-sm font-medium text-red-500">
                  {isDeleting ? "Suppression..." : "Supprimer"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
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
