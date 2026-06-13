import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ValidationRules, hasErrors, FormErrors } from "@/utils/validation";
import type { CreateEntrepriseInput } from "@/services/entreprises";
import { useAuthStore } from "@/store/authStore";
import { AppButton } from "@/components/ui/AppButton";
import { EntrepriseAvatar } from "@/components/ui/EntrepriseAvatar";
import { FormInput } from "@/components/forms/FormInput";
import { ChoiceChip, Form, FormGroup } from "@/components/forms/Form";
import { ENTREPRISE_STATUS_OPTIONS } from "@/components/forms/formDefinitions";
import Constants from "expo-constants";

interface EntrepriseFormProps {
  initialData?: Partial<CreateEntrepriseInput>;
  onSubmit: (data: CreateEntrepriseInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  entrepriseId?: string;
}

export function EntrepriseForm({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Enregistrer",
  entrepriseId,
}: EntrepriseFormProps) {
  const token = useAuthStore((state) => state.token);
  const baseURL =
    Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:3000";
  const [formData, setFormData] = useState<CreateEntrepriseInput>({
    nom: initialData.nom || "",
    statut: initialData.statut || "prospect",
    rue: initialData.rue || "",
    code_postal: initialData.code_postal || "",
    ville: initialData.ville || "",
    pays: initialData.pays || "",
    description: initialData.description || "",
    logo: initialData.logo || "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileNameRef = useRef<string>("");

  const pickImage = async () => {
    if (uploading) {
      Alert.alert("Veuillez patienter", "Upload en cours...");
      return;
    }

    // Sur web: utiliser input HTML file
    if (Platform.OS === "web") {
      fileInputRef.current?.click();
      return;
    }

    // Sur mobile: utiliser expo-image-picker
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        await uploadImage(uri);
      }
    } catch {
      Alert.alert("Erreur", "Impossible de sélectionner l'image");
    }
  };

  // Gérer la sélection de fichier web
  const handleWebFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Sauvegarder le nom du fichier original
      fileNameRef.current = file.name;

      // Lire le fichier en data URL pour pouvoir le passer à uploadImage
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        await uploadImage(dataUrl);
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (uri: string) => {
    if (!token) {
      Alert.alert("Erreur", "Vous devez être connecté pour uploader une image");
      return;
    }

    if (!entrepriseId) {
      Alert.alert(
        "Avertissement",
        "Vous devez créer l'entreprise d'abord avant de pouvoir uploader un logo",
      );
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();

      // Déterminer le nom du fichier
      // Sur web: utiliser le nom sauvegardé du File object
      // Sur mobile: extraire du URI
      let filename: string;
      if (fileNameRef.current) {
        filename = fileNameRef.current;
        fileNameRef.current = ""; // Reset
      } else {
        const uriParts = uri.split("/");
        filename = uriParts[uriParts.length - 1] || "image.jpg";
      }

      // Détecter le type MIME
      let mimeType = "image/jpeg";
      if (filename.toLowerCase().includes(".png")) {
        mimeType = "image/png";
      } else if (filename.toLowerCase().includes(".webp")) {
        mimeType = "image/webp";
      }

      // Ajouter l'entrepriseId au FormData
      formData.append("entrepriseId", entrepriseId);

      // Fetcher le fichier et convertir en blob
      // Sur mobile, utiliser directement l'objet {uri, type, name}
      // Sur web, convertir en blob
      if (Platform.OS === "web") {
        const response = await fetch(uri);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }
        const blob = await response.blob();
        formData.append("image", blob, filename);
      } else {
        // Mobile: passer l'objet avec uri/type/name directement
        const file: any = {
          uri: uri,
          type: mimeType,
          name: filename,
        };
        formData.append("image", file as any);
      }

      // Envoyer au backend
      const uploadResponse = await fetch(`${baseURL}/v1/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse
          .json()
          .catch(() => ({ error: null }));
        throw new Error(
          errorData.error ||
            `Upload failed with status ${uploadResponse.status}`,
        );
      }

      const data = await uploadResponse.json();

      // Stocker le chemin retourné (souvent relatif), on résout en absolu au rendu
      setFormData((prevData) => ({ ...prevData, logo: data.url }));
      Alert.alert("Succès", "Logo uploadé avec succès");
    } catch {
      Alert.alert("Erreur", "Impossible d'uploader l'image");
    } finally {
      setUploading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    errors.nom = ValidationRules.required(formData.nom, "Nom");
    setFormErrors(errors);
    return !hasErrors(errors);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    await onSubmit(formData);
  };

  const bottomSpacing = Platform.OS === "web" ? 32 : 240;

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingBottom: bottomSpacing }}
    >
      <Form>
        <FormGroup title="Nom de l'entreprise" required error={formErrors.nom}>
          <FormInput
            placeholder="Nom de l'entreprise"
            label=""
            value={formData.nom ?? ""}
            onChangeText={(t) => setFormData({ ...formData, nom: t ?? "" })}
            error={null}
          />
        </FormGroup>

        <FormGroup title="Statut">
          <View className="flex-row flex-wrap justify-between gap-3">
            {ENTREPRISE_STATUS_OPTIONS.map((statusOption) => (
              <ChoiceChip
                key={statusOption.value}
                label={statusOption.label}
                selected={formData.statut === statusOption.value}
                onPress={() =>
                  setFormData({ ...formData, statut: statusOption.value })
                }
                className="w-[48%]"
              />
            ))}
          </View>
        </FormGroup>

        <FormGroup title="Adresse">
          <FormGroup title="Rue">
            <FormInput
              placeholder="Numéro et nom de rue"
              label=""
              value={formData.rue ?? ""}
              onChangeText={(t) => setFormData({ ...formData, rue: t ?? "" })}
              error={null}
            />
          </FormGroup>

          <View className="gap-3">
            <FormGroup title="Code postal">
              <FormInput
                placeholder="75000"
                label=""
                value={formData.code_postal ?? ""}
                onChangeText={(t) =>
                  setFormData({ ...formData, code_postal: t ?? "" })
                }
                error={null}
              />
            </FormGroup>
            <FormGroup title="Ville">
              <FormInput
                placeholder="Ville"
                label=""
                value={formData.ville ?? ""}
                onChangeText={(t) =>
                  setFormData({ ...formData, ville: t ?? "" })
                }
                error={null}
              />
            </FormGroup>
          </View>

          <FormGroup title="Pays">
            <FormInput
              placeholder="France"
              label=""
              value={formData.pays ?? ""}
              onChangeText={(t) => setFormData({ ...formData, pays: t ?? "" })}
              error={null}
            />
          </FormGroup>
        </FormGroup>

        <FormGroup title="Description">
          <FormInput
            placeholder="Description de l'entreprise..."
            label=""
            value={formData.description ?? ""}
            onChangeText={(t) =>
              setFormData({ ...formData, description: t ?? "" })
            }
            multiline
            numberOfLines={4}
            error={null}
          />
        </FormGroup>

        <FormGroup title="Logo">
          <View className="rounded-2xl border border-gray-200 bg-white p-4">
            <View className="flex-row items-center gap-4">
              <EntrepriseAvatar
                name={formData.nom}
                logo={formData.logo}
                size={84}
                rounded="xl"
              />
              <View className="flex-1 gap-2">
                <View className="flex-row items-center gap-3 pt-1">
                  <TouchableOpacity onPress={pickImage} disabled={uploading}>
                    <View className="rounded-2xl border border-primary px-4 py-3 self-start">
                      <Text className="text-primary font-semibold">
                        {uploading ? "Upload..." : "Ajouter un fichier"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {formData.logo && (
                    <TouchableOpacity
                      onPress={() => setFormData({ ...formData, logo: "" })}
                      className="rounded-2xl border border-red-200 px-4 py-3"
                    >
                      <Text className="text-red-600 font-semibold">Retirer</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>
        </FormGroup>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <AppButton title="Annuler" onPress={onCancel} variant="secondary" />
          </View>
          <View className="flex-1">
            <AppButton
              title={isLoading ? "En cours..." : submitLabel}
              onPress={handleSubmit}
              isLoading={isLoading}
            />
          </View>
        </View>
      </Form>
      {Platform.OS === "web" && (
        <input
          key="file-input"
          ref={fileInputRef as any}
          type="file"
          accept="image/*"
          onChange={handleWebFileSelect as any}
          style={{ display: "none" }}
        />
      )}
    </ScrollView>
  );
}
