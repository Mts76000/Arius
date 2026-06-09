import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { UploadDevisInput } from "@/services/devis";
import { FormErrors } from "@/utils/validation";
import { FormInput } from "@/components/forms/FormInput";
import { FormHeader, FormSection } from "@/components/forms/Form";
import { getFormModalPresentationStyle } from "@/components/forms/formDefinitions";

interface DevisModalProps {
  visible: boolean;
  onSubmit: (data: UploadDevisInput) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export function DevisModal({
  visible,
  onSubmit,
  onClose,
  isLoading = false,
}: DevisModalProps) {
  const [nom, setNom] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const initializedRef = useRef(false);

  useEffect(() => {
    if (visible && !initializedRef.current) {
      initializedRef.current = true;
      setNom("");
      setNotes("");
      setSelectedFile(null);
      setErrors({});
    }

    if (!visible) {
      initializedRef.current = false;
    }
  }, [visible]);

  const handleFileSelect = () => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf";
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          if (file.size > 20 * 1024 * 1024) {
            Alert.alert("Erreur", "Le fichier dépasse 20 MB");
            return;
          }
          if (file.type !== "application/pdf") {
            Alert.alert("Erreur", "Seuls les fichiers PDF sont autorisés");
            return;
          }
          setSelectedFile(file);
        }
      };
      input.click();
    } else {
      // iOS/Android using expo-document-picker
      pickDocument();
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        if (asset.size && asset.size > 20 * 1024 * 1024) {
          Alert.alert("Erreur", "Le fichier dépasse 20 MB");
          return;
        }

        if (asset.mimeType !== "application/pdf") {
          Alert.alert("Erreur", "Seuls les fichiers PDF sont autorisés");
          return;
        }

        // Convert URI to File-like object for upload
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const file = new File([blob], asset.name || "devis.pdf", {
          type: "application/pdf",
        });

        setSelectedFile(file);
      }
    } catch {
      Alert.alert("Erreur", "Impossible de sélectionner le fichier");
    }
  };

  const handleSubmit = async () => {
    const newErrors: FormErrors = {};

    if (!nom.trim()) {
      newErrors.nom = "Nom du devis requis";
    }

    if (!selectedFile) {
      newErrors.file = "Fichier PDF requis";
    }

    setErrors(newErrors);

    if (Object.values(newErrors).some((e) => e !== null)) {
      return;
    }

    try {
      await onSubmit({
        nom: nom.trim(),
        notes: notes.trim() || undefined,
        file: selectedFile!,
      });
      setNom("");
      setNotes("");
      setSelectedFile(null);
      setErrors({});
      onClose();
    } catch {
      Alert.alert("Erreur", "Impossible de sauvegarder le devis");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={getFormModalPresentationStyle("devis")}
      onRequestClose={onClose}
    >
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <FormHeader
          title="Nouveau devis"
          onCancel={onClose}
          onSave={handleSubmit}
          isSaving={isLoading}
          cancelDisabled={isLoading}
          saveDisabled={isLoading || !selectedFile}
        />

        <FormSection>
          {/* Nom */}
          <FormInput
            label="Nom du devis"
            placeholder="Ex: Devis Q1 2026"
            value={nom}
            onChangeText={setNom}
            editable={!isLoading}
            error={errors.nom}
          />

          {/* Notes */}
          <FormInput
            label="Notes (optionnel)"
            placeholder="Description ou commentaires..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            editable={!isLoading}
            error={null}
          />

          {/* Fichier */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-gray-800">
              Fichier PDF
            </Text>
            <TouchableOpacity
              onPress={handleFileSelect}
              disabled={isLoading}
              className={`rounded-2xl border border-dashed p-4 ${
                errors.file
                  ? "border-red-300 bg-red-50"
                  : selectedFile
                    ? "border-primary bg-primaryLight"
                    : "border-gray-200 bg-gray-50"
              }`}
            >
              <View className="gap-1">
                <View>
                  <Text className="text-gray-900 font-semibold">
                    {selectedFile ? selectedFile.name : "Sélectionner un PDF"}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    {selectedFile
                      ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                      : "PDF uniquement, max 20 MB"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            {errors.file && (
              <Text className="text-red-600 text-sm">{errors.file}</Text>
            )}
          </View>
        </FormSection>
      </ScrollView>
    </Modal>
  );
}
