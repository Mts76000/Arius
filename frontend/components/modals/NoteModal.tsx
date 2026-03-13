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
      <ScrollView>
        <View>
          <AppButton
            title="Annuler"
            onPress={onClose}
            variant="link"
            disabled={isLoading}
          />
          <Text>
            {note ? "Modifier note" : "Nouvelle note"}
          </Text>
          <AppButton
            title={isLoading ? "..." : "Enregistrer"}
            onPress={handleSubmit}
           
            disabled={isLoading}
          />
        </View>

        <View>
          {/* Type Selector */}
          <View>
            <Text>Type</Text>
            <View>
              {NOTE_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => handleSelectType(t)}
                >
                  <Text
                  >
                    {NOTE_TYPE_LABELS[t]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Templates suggestions */}
          <View>
            <View
            >
              <Text>
                💾 Templates pour {NOTE_TYPE_LABELS[type]}
              </Text>
              {templates.length > 0 && (
                <Text>
                  Tap pour insérer
                </Text>
              )}
            </View>
            {templates.length > 0 ? (
              <View>
                {templates.map((template) => (
                  <View
                    key={template._id}
                  >
                    <View
                    >
                      <View>
                        <Text
                          numberOfLines={1}
                        >
                          {template.nom_template || "Sans titre"}
                        </Text>
                        <Text
                          numberOfLines={2}
                        >
                          {template.contenu}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleApplyTemplate(template)}
                      >
                        <Text
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
              >
                <Text
                >
                  💡 Aucun template pour ce type
                </Text>
                <Text>
                  Coche "Enregistrer comme template" en bas pour créer un modèle
                  réutilisable
                </Text>
              </View>
            )}
          </View>

          {/* Content */}
          <View>
            <Text>Contenu</Text>
            <TextInput
              value={contenu}
              onChangeText={setContenu}
              placeholder="Écrivez votre note..."
              multiline
              numberOfLines={6}
              editable={!isLoading}
            />
            {errors.contenu && (
              <Text>
                {errors.contenu}
              </Text>
            )}
          </View>

          {/* Template toggle */}
          <TouchableOpacity
            onPress={() => setIsTemplate(!isTemplate)}
            disabled={isLoading}
          >
            <View
            >
              {isTemplate && <Text>✓</Text>}
            </View>
            <Text>Enregistrer comme template</Text>
          </TouchableOpacity>

          {/* Template name input */}
          {isTemplate && (
            <View>
              <Text>Nom du template</Text>
              <TextInput
                placeholder="ex: Compte-rendu réunion standard"
                value={templateName}
                onChangeText={setTemplateName}
                editable={!isLoading}
              />
              {errors.nom_template && (
                <Text>
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
