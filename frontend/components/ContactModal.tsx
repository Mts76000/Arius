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
      <ScrollView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalClose}>Annuler</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {isEditing ? "Modifier contact" : "Nouveau contact"}
          </Text>
          <TouchableOpacity onPress={onSave}>
            <Text style={styles.modalSave}>Enregistrer</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modalForm}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Prénom</Text>
            <TextInput
              style={styles.input}
              value={contactForm.prenom || ""}
              onChangeText={(text) => onChange("prenom", text)}
              placeholder="Jean"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Nom <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, contactErrors.nom && styles.inputError]}
              value={contactForm.nom}
              onChangeText={(text) => onChange("nom", text)}
              placeholder="Dupont"
            />
            {contactErrors.nom && (
              <Text style={styles.errorText}>{contactErrors.nom}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Poste</Text>
            <TextInput
              style={styles.input}
              value={contactForm.poste || ""}
              onChangeText={(text) => onChange("poste", text)}
              placeholder="Directeur commercial"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, contactErrors.email && styles.inputError]}
              value={contactForm.email || ""}
              onChangeText={(text) => onChange("email", text)}
              placeholder="jean.dupont@exemple.fr"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {contactErrors.email && (
              <Text style={styles.errorText}>{contactErrors.email}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Téléphone mobile</Text>
            <TextInput
              style={styles.input}
              value={contactForm.tel_mobile || ""}
              onChangeText={(text) => onChange("tel_mobile", text)}
              placeholder="06 12 34 56 78"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Téléphone direct</Text>
            <TextInput
              style={styles.input}
              value={contactForm.tel_direct || ""}
              onChangeText={(text) => onChange("tel_direct", text)}
              placeholder="01 23 45 67 89"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Commentaire</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={contactForm.commentaire || ""}
              onChangeText={(text) => onChange("commentaire", text)}
              placeholder="Notes..."
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={onTogglePrincipal}
          >
            <View
              style={[
                styles.checkbox,
                contactForm.contact_principal && styles.checkboxChecked,
              ]}
            >
              {contactForm.contact_principal && (
                <Text style={styles.checkboxCheck}>✓</Text>
              )}
            </View>
            <Text style={styles.checkboxLabel}>Contact principal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Modal>
  );
}
