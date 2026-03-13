import React from "react";
import { View, Text, Pressable } from "react-native";
import { Note, NoteType } from "@/services/notes";

const NOTE_TYPE_ICONS: Record<NoteType, string> = {
  appel: "📞",
  reunion: "🤝",
  email: "📧",
  info: "ℹ️",
  autre: "📝",
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
  { bg: string; text: string; border: string }
> = {
  appel: { bg: "#e0f2fe", text: "#0ea5e9", border: "#bae6fd" },
  reunion: { bg: "#dcfce7", text: "#16a34a", border: "#bbf7d0" },
  email: { bg: "#ede9fe", text: "#7c3aed", border: "#ddd6fe" },
  info: { bg: "#f8fafc", text: "#0f172a", border: "#e2e8f0" },
  autre: { bg: "#fff7ed", text: "#ea580c", border: "#fed7aa" },
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
  onPress?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export function NoteCard({ note, onPress, onDelete, onEdit }: NoteCardProps) {
  const dateWithTime = formatDateWithTime(note.createdAt);
  const colors = TYPE_COLORS[note.type];

  return (
    <Pressable
      onPress={onPress}
    >
      <View>
        <View
        />
        <View>
          <View
          >
            <View
            >
              <View
              >
                <Text>
                  {NOTE_TYPE_ICONS[note.type]}
                </Text>
              </View>
              <View>
                <Text
                >
                  {NOTE_TYPE_LABELS[note.type]}
                </Text>
                <Text
                >
                  {dateWithTime}
                </Text>
              </View>
            </View>
            {note.est_template && (
              <View
              >
                <Text
                >
                  Template
                </Text>
              </View>
            )}
          </View>

          <Text
          >
            {note.contenu}
          </Text>

          <View
          >
            <Pressable
              onPress={onEdit}
            >
              <Text
              >
                Éditer
              </Text>
            </Pressable>
            <Pressable
              onPress={onDelete}
            >
              <Text
              >
                Supprimer
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
