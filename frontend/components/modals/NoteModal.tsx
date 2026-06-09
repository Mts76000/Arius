import React, { useState, useEffect } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { Note, NoteType, CreateNoteInput } from "@/services/notes";
import { FormErrors } from "@/utils/validation";
import { FormInput } from "@/components/forms/FormInput";
import {
  CheckboxRow,
  ChoiceChip,
  FormHeader,
  FormSection,
} from "@/components/forms/Form";
import {
  getFormModalPresentationStyle,
  NOTE_TYPE_OPTIONS,
} from "@/components/forms/formDefinitions";

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

  const getNoteTypeLabel = (noteType: NoteType) =>
    NOTE_TYPE_OPTIONS.find((option) => option.value === noteType)?.label ||
    noteType;

  const handleSubmit = async () => {
    const newErrors: FormErrors = {};

    if (!contenu.trim()) {
      newErrors.contenu = "Contenu requis";
    }

    if (isTemplate && !templateName.trim()) {
      newErrors.nom_template = "Nom du modèle requis";
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
    } catch {
      Alert.alert("Erreur", "Impossible de sauvegarder la note");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={getFormModalPresentationStyle("note")}
      onRequestClose={onClose}
    >
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <FormHeader
          title={note ? "Modifier note" : "Nouvelle note"}
          onCancel={onClose}
          onSave={handleSubmit}
          isSaving={isLoading}
          cancelDisabled={isLoading}
          saveDisabled={isLoading}
        />

        <FormSection>
          {/* Type Selector */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-gray-800">Type</Text>
            <View className="flex-row flex-wrap gap-2">
              {NOTE_TYPE_OPTIONS.map((typeOption) => (
                <ChoiceChip
                  key={typeOption.value}
                  label={typeOption.label}
                  selected={type === typeOption.value}
                  onPress={() => handleSelectType(typeOption.value)}
                />
              ))}
            </View>
          </View>

          {/* Suggestions de modèles */}
          <View className="gap-2">
            <View className="gap-1">
              <Text className="text-sm font-semibold text-gray-800">
                Modèles pour {getNoteTypeLabel(type)}
              </Text>
              {templates.length > 0 && (
                <Text className="text-xs text-gray-500">
                  Touchez un modèle pour l’insérer
                </Text>
              )}
            </View>
            {templates.length > 0 ? (
              <View className="gap-2">
                {templates.map((template) => (
                  <View
                    key={template._id}
                    className="rounded-2xl border border-gray-100 bg-gray-50 p-3"
                  >
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1 gap-1">
                        <Text
                          numberOfLines={1}
                          className="font-medium text-gray-800"
                        >
                          {template.nom_template || "Sans titre"}
                        </Text>
                        <Text
                          numberOfLines={2}
                          className="text-gray-600 text-sm"
                        >
                          {template.contenu}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleApplyTemplate(template)}
                        className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2"
                      >
                        <Text className="text-primary text-xs font-medium">
                          Insérer
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 gap-1">
                <Text className="text-gray-700 font-medium">
                  Aucun modèle pour ce type
                </Text>
                <Text className="text-gray-500 text-sm">
                  {'Cochez "Enregistrer comme modèle" en bas pour créer un texte réutilisable.'}
                </Text>
              </View>
            )}
          </View>

          {/* Content */}
          <View>
            <FormInput
              label="Contenu"
              value={contenu}
              onChangeText={setContenu}
              placeholder="Écrivez votre note..."
              multiline
              numberOfLines={6}
              editable={!isLoading}
              error={errors.contenu}
            />
          </View>

          {/* Bascule modèle */}
          <CheckboxRow
            label="Enregistrer comme modèle"
            checked={isTemplate}
            onPress={() => setIsTemplate(!isTemplate)}
            disabled={isLoading}
          />

          {/* Nom du modèle */}
          {isTemplate && (
            <View>
              <FormInput
                label="Nom du modèle"
                placeholder="ex: Compte-rendu réunion standard"
                value={templateName}
                onChangeText={setTemplateName}
                editable={!isLoading}
                error={errors.nom_template}
              />
            </View>
          )}
        </FormSection>
      </ScrollView>
    </Modal>
  );
}
