import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Note, NoteType } from "@/services/notes";
import { ActionMenu } from "@/components/ui/ActionMenu";

const NOTE_TYPE_ICONS: Record<NoteType, string> = {
  appel: "phone-portrait-outline",
  reunion: "people-outline",
  email: "mail-outline",
  info: "information-circle-outline",
  autre: "document-outline",
};

const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  appel: "Appel",
  reunion: "Réunion",
  email: "Email",
  info: "Info",
  autre: "Autre",
};

const TYPE_COLORS: Record<
  NoteType,
  { bg: string; text: string; border: string; iconColor: string }
> = {
  appel: {
    bg: "#e0f2fe",
    text: "#0ea5e9",
    border: "#bae6fd",
    iconColor: "#0ea5e9",
  },
  reunion: {
    bg: "#dcfce7",
    text: "#16a34a",
    border: "#bbf7d0",
    iconColor: "#16a34a",
  },
  email: {
    bg: "#ede9fe",
    text: "#7c3aed",
    border: "#ddd6fe",
    iconColor: "#7c3aed",
  },
  info: {
    bg: "#f8fafc",
    text: "#0f172a",
    border: "#e2e8f0",
    iconColor: "#0f172a",
  },
  autre: {
    bg: "#fff7ed",
    text: "#ea580c",
    border: "#fed7aa",
    iconColor: "#ea580c",
  },
};

const TAG_LABELS: Record<string, string> = {
  relance: "Relance",
  prioritaire: "Prioritaire",
  risque: "À risque",
  suivi: "Suivi",
  decision: "Décision",
};

// Format date complète avec heure (ex: "27 jan 14:30")
function formatDateWithTime(date?: Date | string | null): string {
  if (!date) return "Date inconnue";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(dateObj.getTime())) return "Date inconnue";

  const day = dateObj.getDate();
  const month = dateObj.toLocaleDateString("fr-FR", { month: "short" });
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");

  return `${day} ${month} ${hours}:${minutes}`;
}

// Format relative time (ex: "il y a 2 heures") avec garde si date absente
function formatTimeAgo(date?: Date | string | null): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(dateObj.getTime())) return "";

  const now = new Date();
  const secondsAgo = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (secondsAgo < 60) return "à l'instant";
  if (secondsAgo < 3600) return `il y a ${Math.floor(secondsAgo / 60)}m`;
  if (secondsAgo < 86400) return `il y a ${Math.floor(secondsAgo / 3600)}h`;
  if (secondsAgo < 604800) return `il y a ${Math.floor(secondsAgo / 86400)}j`;

  return dateObj.toLocaleDateString("fr-FR");
}

interface NoteCardProps {
  note: Note;
  onDelete?: () => void;
  onEdit?: () => void;
}

export function NoteCard({ note, onDelete, onEdit }: NoteCardProps) {
  const dateWithTime = formatDateWithTime(note.createdAt);
  const colors = TYPE_COLORS[note.type];
  const timeAgo = formatTimeAgo(note.createdAt);

  return (
    <View className="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex-col gap-3">
      {/* Header avec type et template badge */}
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 flex-row items-center gap-3">
          {/* Type icon avec couleur */}
          <View
            className="h-10 w-10 items-center justify-center rounded-full border"
            style={{
              backgroundColor: colors.bg,
              borderColor: colors.border,
            }}
          >
            <Ionicons
              name={NOTE_TYPE_ICONS[note.type] as any}
              size={18}
              color={colors.iconColor}
            />
          </View>

          {/* Type et date */}
          <View className="flex-1 gap-1">
            <Text className="text-sm font-bold text-slate-900">
              {NOTE_TYPE_LABELS[note.type]}
            </Text>
            <Text className="text-xs text-slate-500">
              {timeAgo || dateWithTime}
            </Text>
          </View>
        </View>

        <ActionMenu
          items={[
            {
              key: "edit",
              label: "Éditer",
              icon: "pencil-outline",
              iconColor: "#3B82F6",
              onPress: () => onEdit?.(),
            },
            {
              key: "delete",
              label: "Supprimer",
              icon: "trash-outline",
              iconColor: "#EF4444",
              textClassName: "text-red-500",
              onPress: () => onDelete?.(),
            },
          ]}
        />

        {/* Template badge */}
        {note.est_template && (
          <View className="rounded-full bg-amber-100 px-2.5 py-1">
            <Text className="text-xs font-semibold text-amber-700">
              Template
            </Text>
          </View>
        )}
      </View>

      {/* Contenu */}
      <Text className="text-sm text-slate-700 leading-5" numberOfLines={3}>
        {note.contenu}
      </Text>
    </View>
  );
}
