import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Note, NoteType } from "@/services/notes";
import { NoteCard } from "@/components/NoteCard";

interface NotesTabProps {
  notes: Note[] | undefined;
  notesLoading: boolean;
  noteTypeFilter: NoteType | "all";
  noteSearchQuery: string;
  onTypeFilterChange: (type: NoteType | "all") => void;
  onSearchChange: (query: string) => void;
  onAddNote: () => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
}

export const NotesTab: React.FC<NotesTabProps> = ({
  notes,
  notesLoading,
  noteTypeFilter,
  noteSearchQuery,
  onTypeFilterChange,
  onSearchChange,
  onAddNote,
  onEditNote,
  onDeleteNote,
}) => {
  const filteredNotes = notes
    ?.filter((note) => noteTypeFilter === "all" || note.type === noteTypeFilter)
    .filter((note) => {
      if (!noteSearchQuery.trim()) return true;
      const query = noteSearchQuery.toLowerCase();

      // Recherche dans le contenu
      if (note.contenu.toLowerCase().includes(query)) return true;

      // Recherche dans la date (plusieurs formats)
      const dateObj = new Date(note.createdAt);
      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const year = dateObj.getFullYear();
      const monthName = dateObj.toLocaleDateString("fr-FR", {
        month: "short",
      });

      // Formats possibles: "27", "27/01", "27/01/2026", "27 jan", "01/2026", etc.
      const dateFormats = [
        day,
        `${day}/${month}`,
        `${day}/${month}/${year}`,
        `${day} ${monthName}`,
        `${month}/${year}`,
        monthName,
      ];

      return dateFormats.some((fmt) => fmt.toLowerCase().includes(query));
    });

  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "800", color: "#0f172a" }}>
          Notes
        </Text>
        <TouchableOpacity
          onPress={onAddNote}
          style={{
            backgroundColor: "#0ea5e9",
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 14 }}>
            + Nouvelle note
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          marginBottom: 16,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#e5e7eb",
        }}
      >
        <View
          style={{
            backgroundColor: "#f1f5f9",
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 8,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 16, color: "#64748b" }}>🔍</Text>
          <TextInput
            placeholder="Rechercher par titre, date..."
            placeholderTextColor="#94a3b8"
            value={noteSearchQuery}
            onChangeText={onSearchChange}
            style={{ flex: 1, fontSize: 14, color: "#0f172a", padding: 0 }}
          />
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        {[
          { value: "all", label: "Tout" },
          { value: "info", label: "Info" },
          { value: "appel", label: "Appels" },
          { value: "reunion", label: "Réunions" },
          { value: "email", label: "Emails" },
          { value: "autre", label: "Autre" },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.value}
            onPress={() => onTypeFilterChange(filter.value as any)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor:
                noteTypeFilter === filter.value ? "#0ea5e9" : "#f1f5f9",
            }}
          >
            <Text
              style={{
                fontWeight: "600",
                fontSize: 13,
                color: noteTypeFilter === filter.value ? "#ffffff" : "#64748b",
              }}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {notesLoading ? (
        <ActivityIndicator
          size="small"
          color="#0ea5e9"
          style={{ marginTop: 32 }}
        />
      ) : filteredNotes && filteredNotes.length > 0 ? (
        <View style={{ gap: 12 }}>
          {filteredNotes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onEdit={() => onEditNote(note)}
              onDelete={() => onDeleteNote(note._id)}
            />
          ))}
        </View>
      ) : (
        <View
          style={{
            backgroundColor: "#f8fafc",
            borderColor: "#e2e8f0",
            borderWidth: 1,
            borderRadius: 12,
            padding: 24,
            alignItems: "center",
            marginTop: 32,
          }}
        >
          <Text style={{ fontSize: 48, marginBottom: 12 }}>📝</Text>
          <Text
            style={{
              color: "#0f172a",
              fontWeight: "700",
              fontSize: 16,
              marginBottom: 6,
            }}
          >
            Aucune note pour l'instant
          </Text>
          <Text
            style={{
              color: "#64748b",
              fontSize: 14,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            Commence à documenter tes interactions avec ce client
          </Text>
          <TouchableOpacity
            onPress={onAddNote}
            style={{
              backgroundColor: "#0ea5e9",
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "#ffffff", fontWeight: "700" }}>
              + Ajouter une note
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
