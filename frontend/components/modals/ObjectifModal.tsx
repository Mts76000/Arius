import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
  onSave: (objectifs: { mois: number; objectif_ht: number }[]) => void;
  annee: number;
  objectifsExistants?: { mois: number; objectif_ht: number }[];
};

export function ObjectifModal({
  visible,
  onClose,
  onSave,
  annee,
  objectifsExistants = [],
}: Props) {
  const [objectifs, setObjectifs] = useState<{ [key: number]: string }>(() => {
    const initial: { [key: number]: string } = {};
    objectifsExistants.forEach((obj) => {
      initial[obj.mois] = obj.objectif_ht.toString();
    });
    return initial;
  });

  const handleSave = () => {
    const objectifsAEnregistrer = Object.entries(objectifs)
      .filter(([_, value]) => value && parseFloat(value) > 0)
      .map(([mois, value]) => ({
        mois: parseInt(mois),
        objectif_ht: parseFloat(value),
      }));

    onSave(objectifsAEnregistrer);
  };

  const handleAppliquerATous = () => {
    const valeur = objectifs[1] || "0";
    const nouveaux: { [key: number]: string } = {};
    for (let i = 1; i <= 12; i++) {
      nouveaux[i] = valeur;
    }
    setObjectifs(nouveaux);
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
          <Text>Objectifs {annee}</Text>
          <AppButton title="Enregistrer" onPress={handleSave} />
        </View>

        <ScrollView>
          <TouchableOpacity
            onPress={handleAppliquerATous}
          >
            <Ionicons name="copy" size={20} color={"#0ea5e9"} />
            <Text>
              Appliquer janvier à tous les mois
            </Text>
          </TouchableOpacity>

          <View>
            {MOIS_LABELS.map((moisLabel, index) => {
              const moisNum = index + 1;
              return (
                <View key={moisNum}>
                  <Text>{moisLabel}</Text>
                  <View>
                    <TextInput
                      placeholder="0"
                      placeholderTextColor={"#64748b"}
                      keyboardType="numeric"
                      value={objectifs[moisNum] || ""}
                      onChangeText={(text) =>
                        setObjectifs({ ...objectifs, [moisNum]: text })
                      }
                    />
                    <Text>€</Text>
                  </View>
                </View>
              );
            })}
          </View>
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
  quickAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#0ea5e9",
    marginBottom: 20,
  },
  quickActionText: {
    fontSize: 14,
    color: "#0ea5e9",
    fontWeight: "600",
  },
  grid: {
    gap: 12,
  },
  moisCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  moisLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 8,
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
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  inputSuffix: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#64748b",
  },
});
