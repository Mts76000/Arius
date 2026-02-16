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
import { Colors } from "@/constants/theme";
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
      <View style={styles.container}>
        <View style={styles.header}>
          <AppButton title="Annuler" onPress={onClose} variant="link" />
          <Text style={styles.title}>Objectifs {annee}</Text>
          <AppButton title="Enregistrer" onPress={handleSave} size="sm" />
        </View>

        <ScrollView style={styles.content}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={handleAppliquerATous}
          >
            <Ionicons name="copy" size={20} color={Colors.light.tint} />
            <Text style={styles.quickActionText}>
              Appliquer janvier à tous les mois
            </Text>
          </TouchableOpacity>

          <View style={styles.grid}>
            {MOIS_LABELS.map((moisLabel, index) => {
              const moisNum = index + 1;
              return (
                <View key={moisNum} style={styles.moisCard}>
                  <Text style={styles.moisLabel}>{moisLabel}</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      placeholderTextColor={Colors.light.muted}
                      keyboardType="numeric"
                      value={objectifs[moisNum] || ""}
                      onChangeText={(text) =>
                        setObjectifs({ ...objectifs, [moisNum]: text })
                      }
                    />
                    <Text style={styles.inputSuffix}>€</Text>
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
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  closeText: {
    fontSize: 16,
    color: Colors.light.tint,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  saveText: {
    fontSize: 16,
    color: Colors.light.tint,
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
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.tint,
    marginBottom: 20,
  },
  quickActionText: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: "600",
  },
  grid: {
    gap: 12,
  },
  moisCard: {
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  moisLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
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
    color: Colors.light.text,
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  inputSuffix: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.muted,
  },
});
