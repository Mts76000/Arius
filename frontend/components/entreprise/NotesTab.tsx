import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from "react-native";
import { Note, NoteType } from "@/services/notes";
import { NoteCard } from "@/components/cards/NoteCard";

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
  const noteFilters: Array<{ value: NoteType | "all"; label: string }> = [
    { value: "all", label: "Tout" },
    { value: "info", label: "Info" },
    { value: "appel", label: "Appels" },
    { value: "reunion", label: "Reunions" },
    { value: "email", label: "Emails" },
    { value: "autre", label: "Autre" },
  ];

  const hasSearchQuery = noteSearchQuery.trim().length > 0;
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
    <View className="p-5">
      <View className="flex flex-row justify-between pt-5">
        <Text className="text-lg font-bold">Notes</Text>
        <TouchableOpacity onPress={onAddNote}>
          <Text className="text-primary font-semibold text-lg">+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {(notes?.length ?? 0) > 0 && (
        <View className="mt-4 rounded-xl border border-slate-200 bg-white px-3">
          <TextInput
            placeholder="Rechercher une note..."
            placeholderTextColor="#94a3b8"
            value={noteSearchQuery}
            onChangeText={onSearchChange}
            className="py-3 text-slate-900"
          />
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-3"
        contentContainerStyle={{ gap: 8, paddingEnd: 16 }}
      >
        {noteFilters.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            onPress={() => onTypeFilterChange(filter.value)}
            className={`rounded-full border px-4 py-2 ${noteTypeFilter === filter.value ? "border-primary bg-primary/15" : "border-slate-200 bg-white"}`}
          >
            <Text
              className={`text-sm font-semibold whitespace-nowrap ${noteTypeFilter === filter.value ? "text-primary" : "text-slate-600"}`}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View className="mt-5">
        {notesLoading ? (
          <View className="bg-white rounded-3xl p-5 flex-col gap-4">
            <ActivityIndicator size="small" color="#0ea5e9" />
          </View>
        ) : filteredNotes && filteredNotes.length > 0 ? (
          <View className="bg-white rounded-3xl p-5 flex-col gap-4">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onEdit={() => onEditNote(note)}
                onDelete={() => onDeleteNote(note._id)}
              />
            ))}
          </View>
        ) : hasSearchQuery ? (
          <View className="bg-primary rounded-3xl p-4 mt-8 flex items-center w-1/2 self-center">
            <Text className="text-white font-bold">Aucune note trouvée</Text>
          </View>
        ) : (
          <View className="bg-primary rounded-3xl p-4 mt-8 flex items-center w-1/2 self-center">
            <Text className="text-white font-bold">Aucune note</Text>
          </View>
        )}
      </View>
    </View>
  );
};
