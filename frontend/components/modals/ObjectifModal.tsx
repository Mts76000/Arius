import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { FormInput } from "@/components/forms/FormInput";
import { FormHeader, FormSection } from "@/components/forms/Form";
import {
  getFormModalPresentationStyle,
  MONTH_LABELS,
} from "@/components/forms/formDefinitions";

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
      presentationStyle={getFormModalPresentationStyle("objectif")}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50">
        <FormHeader
          title={`Objectifs ${annee}`}
          onCancel={onClose}
          onSave={handleSave}
        />

        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          <TouchableOpacity
            onPress={handleAppliquerATous}
            className="mx-5 mt-4 mb-2 rounded-2xl border border-primary/30 bg-primary/10 p-4 flex-row items-center gap-3"
          >
            <Ionicons name="copy" size={20} color={"#0ea5e9"} />
            <Text className="text-primary font-medium">
              Appliquer janvier à tous les mois
            </Text>
          </TouchableOpacity>

          <FormSection className="my-2">
            {MONTH_LABELS.map((moisLabel, index) => {
              const moisNum = index + 1;
              return (
                <View key={moisNum} className="gap-2">
                  <Text className="text-sm font-medium text-gray-700">
                    {moisLabel}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <FormInput
                      label=""
                      placeholder="0"
                      keyboardType="numeric"
                      value={objectifs[moisNum] || ""}
                      onChangeText={(text) =>
                        setObjectifs({ ...objectifs, [moisNum]: text })
                      }
                      error={null}
                    />
                    <Text className="text-gray-500 font-medium">€</Text>
                  </View>
                </View>
              );
            })}
          </FormSection>
        </ScrollView>
      </View>
    </Modal>
  );
}
