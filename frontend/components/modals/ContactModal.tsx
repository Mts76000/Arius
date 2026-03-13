import React from "react";
import {
  Modal,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { CreateContactInput } from "@/services/contacts";
import { FormErrors } from "@/utils/validation";
import { styles } from "@/styles/entrepriseDetailStyles";
import { AppButton } from "@/components/ui/AppButton";

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
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ScrollView>
        <View>
          <AppButton title="Annuler" onPress={onClose} variant="link" />
          <Text>
            {isEditing ? "Modifier contact" : "Nouveau contact"}
          </Text>
          <AppButton title="Enregistrer" onPress={onSave} />
        </View>

        <View>
          <View>
            <Text>Prénom</Text>
            <TextInput
              value={contactForm.prenom || ""}
              onChangeText={(text) => onChange("prenom", text)}
              placeholder="Jean"
            />
          </View>

          <View>
            <Text>
              Nom <Text>*</Text>
            </Text>
            <TextInput
              value={contactForm.nom}
              onChangeText={(text) => onChange("nom", text)}
              placeholder="Dupont"
            />
            {contactErrors.nom && (
              <Text>{contactErrors.nom}</Text>
            )}
          </View>

          <View>
            <Text>Poste</Text>
            <TextInput
              value={contactForm.poste || ""}
              onChangeText={(text) => onChange("poste", text)}
              placeholder="Directeur commercial"
            />
          </View>

          <View>
            <Text>Email</Text>
            <TextInput
              value={contactForm.email || ""}
              onChangeText={(text) => onChange("email", text)}
              placeholder="jean.dupont@exemple.fr"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {contactErrors.email && (
              <Text>{contactErrors.email}</Text>
            )}
          </View>

          <View>
            <Text>Téléphone mobile</Text>
            <TextInput
              value={contactForm.tel_mobile || ""}
              onChangeText={(text) => onChange("tel_mobile", text)}
              placeholder="06 12 34 56 78"
              keyboardType="phone-pad"
            />
          </View>

          <View>
            <Text>Téléphone direct</Text>
            <TextInput
              value={contactForm.tel_direct || ""}
              onChangeText={(text) => onChange("tel_direct", text)}
              placeholder="01 23 45 67 89"
              keyboardType="phone-pad"
            />
          </View>

          <View>
            <Text>Commentaire</Text>
            <TextInput
              value={contactForm.commentaire || ""}
              onChangeText={(text) => onChange("commentaire", text)}
              placeholder="Notes..."
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            onPress={onTogglePrincipal}
          >
            <View
            >
              {contactForm.contact_principal && (
                <Text>✓</Text>
              )}
            </View>
            <Text>Contact principal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Modal>
  );
}
