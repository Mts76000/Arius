import React, { useState, useEffect } from "react";
import { Modal, ScrollView, View, Text, TouchableOpacity } from "react-native";
import { Note, NoteType, CreateNoteInput } from "@/services/notes";
import { FormErrors } from "@/utils/validation";
import { FormInput } from "@/components/forms/FormInput";
import { FormHeader } from "@/components/forms/Form";
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

        <View className="mx-5 my-4 rounded-3xl bg-white p-5 shadow-sm gap-4">
          {/* Type Selector */}
          <View className="gap-2">
            <Text className="text-sm font-medium text-gray-700">Type</Text>
            <View className="flex-row flex-wrap gap-2">
              {NOTE_TYPE_OPTIONS.map((typeOption) => (
                <TouchableOpacity
                  key={typeOption.value}
                  onPress={() => handleSelectType(typeOption.value)}
                  className={`rounded-full px-4 py-2 border ${type === typeOption.value ? "bg-primary border-primary" : "bg-white border-gray-300"}`}
                >
                  <Text
                    className={
                      type === typeOption.value
                        ? "text-white font-semibold"
                        : "text-gray-700"
                    }
                  >
                    {typeOption.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Templates suggestions */}
          <View className="gap-2">
            <View className="gap-1">
              <Text className="text-sm font-medium text-gray-700">
                Templates pour {getNoteTypeLabel(type)}
              </Text>
              {templates.length > 0 && (
                <Text className="text-xs text-gray-500">Tap pour insérer</Text>
              )}
            </View>
            {templates.length > 0 ? (
              <View className="gap-2">
                {templates.map((template) => (
                  <View
                    key={template._id}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-3"
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
                        className="rounded-full border border-primary px-3 py-1"
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
              <View className="rounded-2xl border border-dashed border-gray-300 p-3 gap-1">
                <Text className="text-gray-700 font-medium">
                  Aucun template pour ce type
                </Text>
                <Text className="text-gray-500 text-sm">
                  Coche "Enregistrer comme template" en bas pour créer un modèle
                  réutilisable
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

          {/* Template toggle */}
          <TouchableOpacity
            onPress={() => setIsTemplate(!isTemplate)}
            disabled={isLoading}
            className="flex-row items-center gap-2"
          >
            <View
              className={`w-5 h-5 rounded border items-center justify-center ${isTemplate ? "bg-primary border-primary" : "border-gray-300"}`}
            >
              {isTemplate && <Text className="text-white text-xs">✓</Text>}
            </View>
            <Text className="text-gray-700">Enregistrer comme template</Text>
          </TouchableOpacity>

          {/* Template name input */}
          {isTemplate && (
            <View>
              <FormInput
                label="Nom du template"
                placeholder="ex: Compte-rendu réunion standard"
                value={templateName}
                onChangeText={setTemplateName}
                editable={!isLoading}
                error={errors.nom_template}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </Modal>
  );
}
