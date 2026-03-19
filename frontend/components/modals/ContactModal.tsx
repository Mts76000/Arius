import React from "react";
import {
  Modal,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { CreateContactInput } from "@/services/contacts";
import { FormErrors } from "@/utils/validation";
import { FormInput } from "@/components/forms/FormInput";
import { FormHeader } from "@/components/forms/Form";
import { getFormModalPresentationStyle } from "@/components/forms/formDefinitions";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  isEditing: boolean;
  contactForm: CreateContactInput;
  contactErrors: FormErrors;
  onChange: (field: keyof CreateContactInput, value: string) => void;
  onTogglePrincipal: () => void;
};

export function ContactModal({
  visible,
  onClose,
  onSave,
  isEditing,
  contactForm,
  contactErrors,
  onChange,
  onTogglePrincipal,
}: Props) {
  const { height } = useWindowDimensions();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={getFormModalPresentationStyle("contact")}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        className="flex-1 bg-gray-50"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <FormHeader
            title={isEditing ? "Modifier contact" : "Nouveau contact"}
            onCancel={onClose}
            onSave={onSave}
          />

          <View className="mx-5 my-4 rounded-3xl bg-white p-5 shadow-sm gap-4">
            <View>
              <FormInput
                label="Prénom"
                value={contactForm.prenom || ""}
                onChangeText={(text) => onChange("prenom", text)}
                placeholder="Jean"
                error={null}
              />
            </View>

            <View>
              <FormInput
                label="Nom"
                value={contactForm.nom}
                onChangeText={(text) => onChange("nom", text)}
                placeholder="Dupont"
                error={contactErrors.nom}
              />
            </View>

            <View>
              <FormInput
                label="Poste"
                value={contactForm.poste || ""}
                onChangeText={(text) => onChange("poste", text)}
                placeholder="Directeur commercial"
                error={null}
              />
            </View>

            <View>
              <FormInput
                label="Email"
                value={contactForm.email || ""}
                onChangeText={(text) => onChange("email", text)}
                placeholder="jean.dupont@exemple.fr"
                keyboardType="email-address"
                autoCapitalize="none"
                error={contactErrors.email}
              />
            </View>

            <View>
              <FormInput
                label="Téléphone mobile"
                value={contactForm.tel_mobile || ""}
                onChangeText={(text) => onChange("tel_mobile", text)}
                placeholder="06 12 34 56 78"
                keyboardType="phone-pad"
                error={null}
              />
            </View>

            <View>
              <FormInput
                label="Téléphone direct"
                value={contactForm.tel_direct || ""}
                onChangeText={(text) => onChange("tel_direct", text)}
                placeholder="01 23 45 67 89"
                keyboardType="phone-pad"
                error={null}
              />
            </View>

            <View>
              <FormInput
                label="Commentaire"
                value={contactForm.commentaire || ""}
                onChangeText={(text) => onChange("commentaire", text)}
                placeholder="Notes..."
                multiline
                numberOfLines={4}
                error={null}
              />
            </View>

            <TouchableOpacity
              onPress={onTogglePrincipal}
              className="flex-row items-center gap-2 pt-1"
            >
              <View
                className={`w-5 h-5 rounded border items-center justify-center ${contactForm.contact_principal ? "bg-primary border-primary" : "border-gray-300"}`}
              >
                {contactForm.contact_principal && (
                  <Text className="text-white text-xs">✓</Text>
                )}
              </View>
              <Text className="text-gray-700">Contact principal</Text>
            </TouchableOpacity>
          </View>

          {/* Espace tampon pour pouvoir scroller sous le footer de sheet/tab */}
          <View style={{ height: Math.max(140, Math.round(height * 0.22)) }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
