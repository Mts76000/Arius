import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { UploadDevisInput } from "@/services/devis";
import { FormErrors } from "@/utils/validation";
import { styles } from "@/styles/entrepriseDetailStyles";

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
    } catch (error) {
      console.error("Error picking document:", error);
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
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      Alert.alert("Erreur", "Impossible de sauvegarder le devis");
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
          <TouchableOpacity onPress={onClose} disabled={isLoading}>
            <Text style={styles.modalClose}>Annuler</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Nouveau Devis</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading || !selectedFile}
          >
            <Text
              style={[
                styles.modalSave,
                (isLoading || !selectedFile) && { opacity: 0.5 },
              ]}
            >
              {isLoading ? "..." : "Enregistrer"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modalForm}>
          {/* Nom */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom du devis</Text>
            <TextInput
              style={[styles.input, errors.nom && { borderColor: "#ef4444" }]}
              placeholder="Ex: Devis Q1 2026"
              value={nom}
              onChangeText={setNom}
              editable={!isLoading}
            />
            {errors.nom && (
              <Text style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
                {errors.nom}
              </Text>
            )}
          </View>

          {/* Notes */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Notes (optionnel)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description ou commentaires..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              editable={!isLoading}
            />
          </View>

          {/* Fichier */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Fichier PDF</Text>
            <TouchableOpacity
              onPress={handleFileSelect}
              disabled={isLoading}
              style={{
                borderWidth: 2,
                borderStyle: "dashed",
                borderColor: selectedFile
                  ? "#10b981"
                  : errors.file
                    ? "#ef4444"
                    : "#cbd5e1",
                paddingVertical: 24,
                borderRadius: 8,
                alignItems: "center",
                backgroundColor: selectedFile ? "#f0fdf4" : "#f8fafc",
              }}
            >
              <Text style={{ fontSize: 32, marginBottom: 8 }}>📄</Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#0f172a",
                  marginBottom: 4,
                }}
              >
                {selectedFile ? selectedFile.name : "Sélectionner un PDF"}
              </Text>
              {selectedFile && (
                <Text style={{ fontSize: 12, color: "#64748b" }}>
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Text>
              )}
              {!selectedFile && (
                <Text style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                  PDF uniquement, max 20 MB
                </Text>
              )}
            </TouchableOpacity>
            {errors.file && (
              <Text style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
                {errors.file}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
}
