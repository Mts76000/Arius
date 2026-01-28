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
      className="mb-3"
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 16,
        overflow: "hidden",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        borderColor: "#e5e7eb",
        borderWidth: 1,
      }}
    >
      <View style={{ flexDirection: "row" }}>
        <View
          style={{
            width: 6,
            backgroundColor: colors.text,
            opacity: 0.9,
          }}
        />
        <View style={{ flex: 1, padding: 14 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  borderWidth: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 20 }}>
                  {NOTE_TYPE_ICONS[note.type]}
                </Text>
              </View>
              <View>
                <Text
                  style={{ color: "#0f172a", fontWeight: "800", fontSize: 15 }}
                >
                  {NOTE_TYPE_LABELS[note.type]}
                </Text>
                <Text
                  style={{ color: "#6b7280", fontSize: 12, fontWeight: "500" }}
                >
                  {dateWithTime}
                </Text>
              </View>
            </View>
            {note.est_template && (
              <View
                style={{
                  backgroundColor: "#eef2ff",
                  borderColor: "#c7d2fe",
                  borderWidth: 1,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{ color: "#4338ca", fontWeight: "700", fontSize: 12 }}
                >
                  Template
                </Text>
              </View>
            )}
          </View>

          <Text
            style={{
              color: "#111827",
              fontSize: 15,
              lineHeight: 22,
              marginBottom: 10,
            }}
          >
            {note.contenu}
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: 8,
              paddingTop: 10,
              borderTopWidth: 1,
              borderTopColor: "#e5e7eb",
            }}
          >
            <Pressable
              onPress={onEdit}
              style={{
                backgroundColor: "#e0f2fe",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 10,
              }}
            >
              <Text
                style={{ color: "#0369a1", fontWeight: "700", fontSize: 13 }}
              >
                Éditer
              </Text>
            </Pressable>
            <Pressable
              onPress={onDelete}
              style={{
                backgroundColor: "#fee2e2",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 10,
              }}
            >
              <Text
                style={{ color: "#b91c1c", fontWeight: "700", fontSize: 13 }}
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
