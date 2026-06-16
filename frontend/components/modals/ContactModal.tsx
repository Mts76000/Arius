import React from "react";
import {
  Modal,
  ScrollView,
  View,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { CreateContactInput } from "@/services/contacts";
import { FormErrors } from "@/utils/validation";
import { FormInput } from "@/components/forms/FormInput";
import { CheckboxRow, FormHeader, FormSection } from "@/components/forms/Form";
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
  const sanitizePhone = (value: string) =>
    value.replace(/[^\d+\s().-]/g, "");

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
            title={isEditing ? "Modifier le contact" : "Nouveau contact"}
            onCancel={onClose}
            onSave={onSave}
          />

          <FormSection>
            <FormInput
              label="Prénom"
              value={contactForm.prenom || ""}
              onChangeText={(text) => onChange("prenom", text)}
              placeholder="Jean"
              error={null}
            />

            <FormInput
              label="Nom"
              value={contactForm.nom}
              onChangeText={(text) => onChange("nom", text)}
              placeholder="Dupont"
              error={contactErrors.nom}
            />

            <FormInput
              label="Poste"
              value={contactForm.poste || ""}
              onChangeText={(text) => onChange("poste", text)}
              placeholder="Directeur commercial"
              error={null}
            />

            <FormInput
              label="Email"
              value={contactForm.email || ""}
              onChangeText={(text) => onChange("email", text)}
              placeholder="jean.dupont@exemple.fr"
              keyboardType="email-address"
              autoCapitalize="none"
              error={contactErrors.email}
            />

            <FormInput
              label="Téléphone mobile"
              value={contactForm.tel_mobile || ""}
              onChangeText={(text) => onChange("tel_mobile", sanitizePhone(text))}
              placeholder="06 12 34 56 78"
              keyboardType="phone-pad"
              error={null}
            />

            <FormInput
              label="Téléphone direct"
              value={contactForm.tel_direct || ""}
              onChangeText={(text) => onChange("tel_direct", sanitizePhone(text))}
              placeholder="01 23 45 67 89"
              keyboardType="phone-pad"
              error={null}
            />

            <FormInput
              label="Commentaire"
              value={contactForm.commentaire || ""}
              onChangeText={(text) => onChange("commentaire", text)}
              placeholder="Notes..."
              multiline
              numberOfLines={4}
              error={null}
            />

            <CheckboxRow
              label="Contact principal"
              checked={!!contactForm.contact_principal}
              onPress={onTogglePrincipal}
            />
          </FormSection>

          {/* Espace tampon pour pouvoir scroller sous le footer de sheet/tab */}
          <View style={{ height: Math.max(140, Math.round(height * 0.22)) }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
