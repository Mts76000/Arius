import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { ValidationRules, hasErrors, FormErrors } from "@/utils/validation";
import type { CreateEntrepriseInput } from "@/services/entreprises";
import { useAuthStore } from "@/store/authStore";
import { AppButton } from "@/components/ui/AppButton";
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
    } catch (error) {
      console.error("pickImage error:", error);
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
        const errorData = await uploadResponse.json().catch(() => ({}));
        console.error("Upload response error:", errorData);
        throw new Error(
          errorData.error ||
            `Upload failed with status ${uploadResponse.status}`,
        );
      }

      const data = await uploadResponse.json();

      // Stocker le chemin retourné (souvent relatif), on résout en absolu au rendu
      setFormData((prevData) => ({ ...prevData, logo: data.url }));
      Alert.alert("Succès", "Logo uploadé avec succès");
    } catch (error) {
      console.error("Upload error:", error);
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

  return (
    <ScrollView>
      <View>
        <Text>Nom de l&apos;entreprise *</Text>
        <TextInput
          placeholder="Nom de l'entreprise"
          placeholderTextColor="#9ca3af"
          value={formData.nom ?? ""}
          onChangeText={(t) => setFormData({ ...formData, nom: t ?? "" })}
        />
        {formErrors.nom && (
          <Text>{formErrors.nom}</Text>
        )}
      </View>
      <View>
        <Text>Statut</Text>
        <View>
          {(["client", "prospect", "fournisseur", "a_reactiver"] as const).map(
            (s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setFormData({ ...formData, statut: s })}
              >
                <Text
                >
                  {s === "a_reactiver" ? "À réactiver" : s}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </View>
      </View>
      <View>
        <Text>Adresse</Text>
        <View>
          <Text>Rue</Text>
          <TextInput
            placeholder="Numéro et nom de rue"
            placeholderTextColor="#9ca3af"
            value={formData.rue ?? ""}
            onChangeText={(t) => setFormData({ ...formData, rue: t ?? "" })}
          />
        </View>
        <View>
          <View>
            <Text>Code Postal</Text>
            <TextInput
              placeholder="75000"
              placeholderTextColor="#9ca3af"
              value={formData.code_postal ?? ""}
              onChangeText={(t) =>
                setFormData({ ...formData, code_postal: t ?? "" })
              }
            />
          </View>
          <View>
            <Text>Ville</Text>
            <TextInput
              placeholder="Ville"
              placeholderTextColor="#9ca3af"
              value={formData.ville ?? ""}
              onChangeText={(t) => setFormData({ ...formData, ville: t ?? "" })}
            />
          </View>
        </View>
        <View>
          <Text>Pays</Text>
          <TextInput
            placeholder="France"
            placeholderTextColor="#9ca3af"
            value={formData.pays ?? ""}
            onChangeText={(t) => setFormData({ ...formData, pays: t ?? "" })}
          />
        </View>
      </View>
      <View>
        <Text>Description</Text>
        <TextInput
          placeholder="Description de l'entreprise..."
          placeholderTextColor="#9ca3af"
          value={formData.description ?? ""}
          onChangeText={(t) =>
            setFormData({ ...formData, description: t ?? "" })
          }
          multiline
          numberOfLines={4}
        />
      </View>
      <View>
        <Text>Logo</Text>
        <View>
          {formData.logo && (
            <Image
              source={{
                uri: formData.logo.startsWith("http")
                  ? formData.logo
                  : `${baseURL}${formData.logo}`,
              }}
            />
          )}
          <View>
            <TouchableOpacity
              onPress={pickImage}
              disabled={uploading}
            >
              <Ionicons name="image" size={20} color="#2563eb" />
              <Text>Galerie</Text>
            </TouchableOpacity>
          </View>
          {formData.logo && (
            <TouchableOpacity
              onPress={() => setFormData({ ...formData, logo: "" })}
            >
              <Ionicons name="close" size={18} color="#dc2626" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View>
        <AppButton
          title="Annuler"
          onPress={onCancel}
          variant="secondary"
        />
        <AppButton
          title={isLoading ? "En cours..." : submitLabel}
          onPress={handleSubmit}
          isLoading={isLoading}
        />
      </View>
      {Platform.OS === "web" && (
        <input
          key="file-input"
          ref={fileInputRef as any}
          type="file"
          accept="image/*"
          onChange={handleWebFileSelect as any}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  content: { padding: 24, paddingBottom: 40 },
  formGroup: { marginBottom: 20 },
  label: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    color: "#1f2937",
    borderWidth: 1,
    borderColor: "#d1d5db",
    fontSize: 16,
  },
  textarea: {
    textAlignVertical: "top",
    minHeight: 100,
  },
  buttonGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statut: {
    flex: 1,
    minWidth: "47%",
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  statutActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  statutText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  statutTextActive: { color: "#fff" },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 32,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  cancelText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "700",
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    alignItems: "center",
  },
  inputError: {
    borderColor: "#ef4444",
    borderWidth: 2,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
    marginTop: 6,
    fontWeight: "500",
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  hint: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    fontStyle: "italic",
  },
  logoContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    gap: 12,
  },
  logoPreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
  },
  logoButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  logoBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 8,
  },
  logoBtnText: {
    color: "#2563eb",
    fontSize: 13,
    fontWeight: "600",
  },
  removeLogo: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 4,
    borderWidth: 1,
    borderColor: "#fee2e2",
  },
});
