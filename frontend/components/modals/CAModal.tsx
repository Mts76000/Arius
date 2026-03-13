import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";

import { Entreprise } from "@/services/entreprises";
import { AppButton } from "@/components/ui/AppButton";

const MOIS_LABELS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (data: {
    entreprise_id: string;
    mois: number;
    annee: number;
    ca_ht: number;
  }) => void;
  entreprises: Entreprise[];
  entrepriseIdInitial?: string;
  moisInitial?: number;
  anneeInitiale?: number;
  caInitial?: number;
  isEditing?: boolean;
};

export function CAModal({
  visible,
  onClose,
  onSave,
  entreprises,
  entrepriseIdInitial,
  moisInitial,
  anneeInitiale,
  caInitial,
  isEditing = false,
}: Props) {
  const currentDate = new Date();
  const annees = [
    currentDate.getFullYear() - 2,
    currentDate.getFullYear() - 1,
    currentDate.getFullYear(),
    currentDate.getFullYear() + 1,
  ];

  // Ensure anneeInitiale is in the list of available years
  const validAnnee = annees.includes(anneeInitiale || currentDate.getFullYear())
    ? anneeInitiale
    : currentDate.getFullYear();

  const [entrepriseId, setEntrepriseId] = useState(entrepriseIdInitial || "");
  const [mois, setMois] = useState(moisInitial || currentDate.getMonth() + 1);
  const [annee, setAnnee] = useState(validAnnee || currentDate.getFullYear());
  const [ca, setCa] = useState(caInitial?.toString() || "");

  useEffect(() => {
    if (visible) {
      setEntrepriseId(entrepriseIdInitial || "");
      setMois(moisInitial || currentDate.getMonth() + 1);
      setAnnee(validAnnee || currentDate.getFullYear());
      setCa(caInitial?.toString() || "");
    }
  }, [visible, entrepriseIdInitial, moisInitial, anneeInitiale, caInitial]);

  const handleSave = () => {
    if (!entrepriseId || !ca || parseFloat(ca) < 0) {
      alert("Veuillez remplir tous les champs correctement");
      return;
    }

    onSave({
      entreprise_id: entrepriseId,
      mois: Math.floor(mois),
      annee: Math.floor(annee),
      ca_ht: parseFloat(ca),
    });

    // Reset form
    setEntrepriseId("");
    setCa("");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View>
        <View>
          <AppButton title="Annuler" onPress={onClose} variant="link" />
          <Text>
            {isEditing ? "Modifier CA" : "Ajouter du CA"}
          </Text>
          <AppButton title="Enregistrer" onPress={handleSave} />
        </View>

        <ScrollView>
          {/* Entreprise */}
          <View>
            <Text>Entreprise *</Text>
            <View>
              <Picker
                selectedValue={entrepriseId}
                onValueChange={setEntrepriseId}
                enabled={!isEditing}
              >
                <Picker.Item label="Sélectionner une entreprise" value="" />
                {entreprises.map((e) => (
                  <Picker.Item key={e.id} label={e.nom} value={e.id} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Mois */}
          <View>
            <Text>Mois *</Text>
            <View>
              <Picker
                selectedValue={mois}
                onValueChange={(value) => setMois(value)}
                enabled={!isEditing}
              >
                {MOIS_LABELS.map((moisLabel, index) => (
                  <Picker.Item
                    key={index + 1}
                    label={moisLabel}
                    value={index + 1}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Année */}
          <View>
            <Text>Année *</Text>
            <View>
              <Picker
                selectedValue={annee}
                onValueChange={(value) => setAnnee(value)}
                enabled={!isEditing}
              >
                {annees.map((a) => (
                  <Picker.Item key={a} label={a.toString()} value={a} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Montant CA */}
          <View>
            <Text>Montant (€) *</Text>
            <View>
              <TextInput
                placeholder="0.00"
                placeholderTextColor={"#64748b"}
                keyboardType="numeric"
                value={ca}
                onChangeText={setCa}
              />
              <Text>€</Text>
            </View>
          </View>

          {/* Alerte mois futur */}
          {annee > currentDate.getFullYear() ||
          (annee === currentDate.getFullYear() &&
            mois > currentDate.getMonth() + 1) ? (
            <View>
              <Ionicons name="warning" size={20} color="#856404" />
              <Text>
                Vous ajoutez du CA pour un mois futur
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  closeText: {
    fontSize: 16,
    color: "#0ea5e9",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  saveText: {
    fontSize: 16,
    color: "#0ea5e9",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  picker: {
    height: Platform.OS === "ios" ? 200 : 50,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  inputSuffix: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#64748b",
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF3CD",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  warningText: {
    fontSize: 14,
    color: "#856404",
    flex: 1,
  },
});
