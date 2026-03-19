import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Note, NoteType } from "@/services/notes";
import { NoteCard } from "@/components/cards/NoteCard";
import { AppButton } from "@/components/ui/AppButton";

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
    <View className="p-5">
      <View className="flex flex-row justify-between pt-5">
        <Text className="text-lg font-bold">Notes</Text>
        <TouchableOpacity onPress={onAddNote}>
          <Text className="text-primary font-semibold text-lg">+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      <View>
        <View>
          <Text>🔍</Text>
          <TextInput
            placeholder="Rechercher par titre, date..."
            placeholderTextColor="#94a3b8"
            value={noteSearchQuery}
            onChangeText={onSearchChange}
          />
        </View>
      </View>

      <View>
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
          >
            <Text>{filter.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {notesLoading ? (
        <ActivityIndicator size="small" color="#0ea5e9" />
      ) : filteredNotes && filteredNotes.length > 0 ? (
        <View>
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
        <View>
          <Text>📝</Text>
          <Text>Aucune note pour l'instant</Text>
          <Text>Commence à documenter tes interactions avec ce client</Text>
          <TouchableOpacity onPress={onAddNote}>
            <Text>+ Ajouter une note</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
