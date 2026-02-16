import React, { useState, useEffect } from "react";
import {
  Modal,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Note, NoteType, CreateNoteInput } from "@/services/notes";
import { ValidationRules, FormErrors } from "@/utils/validation";
import { styles } from "@/styles/entrepriseDetailStyles";
import { AppButton } from "@/components/ui/AppButton";

interface NoteModalProps {
  visible: boolean;
  entrepriseId: string;
  note?: Note | null;
  templates?: Note[];
  onSubmit: (data: CreateNoteInput) => Promise<void>;
  onTypeChange?: (type: NoteType) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const NOTE_TYPES: NoteType[] = ["appel", "reunion", "email", "info", "autre"];

const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  appel: "Appel",
  reunion: "Réunion",
  email: "Email",
  info: "Info",
  autre: "Autre",
};

export function NoteModal({
  visible,
  entrepriseId,
  note,
  templates = [],
  onSubmit,
  onTypeChange,
  onClose,
  isLoading = false,
}: NoteModalProps) {
  const [type, setType] = useState<NoteType>("info");
  const [contenu, setContenu] = useState("");
  const [isTemplate, setIsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (note) {
      setType(note.type);
      setContenu(note.contenu);
      setIsTemplate(note.est_template);
      setTemplateName(note.nom_template || "");
    } else {
      reset();
    }
  }, [note, visible]);

  const reset = () => {
    setType("info");
    setContenu("");
    setIsTemplate(false);
    setTemplateName("");
  };

  const handleApplyTemplate = (template: Note) => {
    setContenu(template.contenu);
    setType(template.type);
    onTypeChange?.(template.type);
  };

  const handleSelectType = (value: NoteType) => {
    setType(value);
    onTypeChange?.(value);
  };

  const handleSubmit = async () => {
    const newErrors: FormErrors = {};

    if (!contenu.trim()) {
      newErrors.contenu = "Contenu requis";
    }

    if (isTemplate && !templateName.trim()) {
      newErrors.nom_template = "Nom du template requis";
    }

    setErrors(newErrors);

    if (Object.values(newErrors).some((e) => e !== null)) {
      return;
    }

    const data: CreateNoteInput = {
      entreprise_id: entrepriseId,
      contenu: contenu.trim(),
      type,
      est_template: isTemplate,
      nom_template: isTemplate ? templateName : undefined,
    };

    try {
      await onSubmit(data);
      setErrors({});
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ScrollView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <AppButton
            title="Annuler"
            onPress={onClose}
            variant="link"
            disabled={isLoading}
          />
          <Text style={styles.modalTitle}>
            {note ? "Modifier note" : "Nouvelle note"}
          </Text>
          <AppButton
            title={isLoading ? "..." : "Enregistrer"}
            onPress={handleSubmit}
            size="sm"
            disabled={isLoading}
          />
        </View>

        <View style={styles.modalForm}>
          {/* Type Selector */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Type</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {NOTE_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => handleSelectType(t)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: type === t ? "#2563eb" : "#e5e7eb",
                  }}
                >
                  <Text
                    style={{
                      color: type === t ? "#ffffff" : "#374151",
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    {NOTE_TYPE_LABELS[t]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Templates suggestions */}
          <View style={styles.formGroup}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <Text style={styles.label}>
                💾 Templates pour {NOTE_TYPE_LABELS[type]}
              </Text>
              {templates.length > 0 && (
                <Text style={{ color: "#6b7280", fontSize: 12 }}>
                  Tap pour insérer
                </Text>
              )}
            </View>
            {templates.length > 0 ? (
              <View style={{ gap: 10 }}>
                {templates.map((template) => (
                  <View
                    key={template._id}
                    style={{
                      backgroundColor: "#f8fafc",
                      borderColor: "#e2e8f0",
                      borderWidth: 1,
                      borderRadius: 12,
                      padding: 12,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
                      <View style={{ flex: 1, marginRight: 12 }}>
                        <Text
                          style={{
                            color: "#0f172a",
                            fontSize: 14,
                            fontWeight: "800",
                          }}
                          numberOfLines={1}
                        >
                          {template.nom_template || "Sans titre"}
                        </Text>
                        <Text
                          style={{
                            color: "#475569",
                            fontSize: 12,
                            marginTop: 2,
                          }}
                          numberOfLines={2}
                        >
                          {template.contenu}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleApplyTemplate(template)}
                        style={{
                          backgroundColor: "#0ea5e9",
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 10,
                        }}
                      >
                        <Text
                          style={{
                            color: "#0b1120",
                            fontWeight: "800",
                            fontSize: 12,
                          }}
                        >
                          Insérer
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View
                style={{
                  backgroundColor: "#fef3c7",
                  borderColor: "#fcd34d",
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <Text
                  style={{ color: "#92400e", fontSize: 12, fontWeight: "600" }}
                >
                  💡 Aucun template pour ce type
                </Text>
                <Text style={{ color: "#b45309", fontSize: 11, marginTop: 4 }}>
                  Coche "Enregistrer comme template" en bas pour créer un modèle
                  réutilisable
                </Text>
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Contenu</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                errors.contenu && { borderColor: "#ef4444" },
              ]}
              value={contenu}
              onChangeText={setContenu}
              placeholder="Écrivez votre note..."
              multiline
              numberOfLines={6}
              editable={!isLoading}
            />
            {errors.contenu && (
              <Text style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
                {errors.contenu}
              </Text>
            )}
          </View>

          {/* Template toggle */}
          <TouchableOpacity
            onPress={() => setIsTemplate(!isTemplate)}
            style={styles.checkboxRow}
            disabled={isLoading}
          >
            <View
              style={[styles.checkbox, isTemplate && styles.checkboxChecked]}
            >
              {isTemplate && <Text style={styles.checkboxCheck}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Enregistrer comme template</Text>
          </TouchableOpacity>

          {/* Template name input */}
          {isTemplate && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nom du template</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.nom_template && { borderColor: "#ef4444" },
                ]}
                placeholder="ex: Compte-rendu réunion standard"
                value={templateName}
                onChangeText={setTemplateName}
                editable={!isLoading}
              />
              {errors.nom_template && (
                <Text style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
                  {errors.nom_template}
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </Modal>
  );
}
