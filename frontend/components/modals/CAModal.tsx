import React, { useState, useEffect } from "react";
import { Modal, View, Text, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";

import { Entreprise } from "@/services/entreprises";
import { FormInput } from "@/components/forms/FormInput";
import { FormHeader } from "@/components/forms/Form";
import {
  getFormModalPresentationStyle,
  MONTH_LABELS,
} from "@/components/forms/formDefinitions";

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
      presentationStyle={getFormModalPresentationStyle("ca")}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50">
        <FormHeader
          title={isEditing ? "Modifier CA" : "Ajouter du CA"}
          onCancel={onClose}
          onSave={handleSave}
        />

        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {/* Entreprise */}
          <View className="mx-5 mt-4 rounded-3xl bg-white p-5 shadow-sm gap-4">
            <Text className="text-sm font-medium text-gray-700">
              Entreprise *
            </Text>
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
          <View className="mx-5 my-4 rounded-3xl bg-white p-5 shadow-sm gap-4">
            <Text className="text-sm font-medium text-gray-700">Mois *</Text>
            <View>
              <Picker
                selectedValue={mois}
                onValueChange={(value) => setMois(value)}
                enabled={!isEditing}
              >
                {MONTH_LABELS.map((moisLabel, index) => (
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
          <View className="mx-5 my-4 rounded-3xl bg-white p-5 shadow-sm gap-4">
            <Text className="text-sm font-medium text-gray-700">Année *</Text>
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
          <View className="mx-5 my-4 rounded-3xl bg-white p-5 shadow-sm gap-4">
            <Text className="text-sm font-medium text-gray-700">
              Montant (€) *
            </Text>
            <View className="flex-row items-center gap-2">
              <FormInput
                label=""
                placeholder="0.00"
                keyboardType="numeric"
                value={ca}
                onChangeText={setCa}
                error={null}
              />
              <Text className="text-gray-500 font-medium">€</Text>
            </View>
          </View>

          {/* Alerte mois futur */}
          {annee > currentDate.getFullYear() ||
          (annee === currentDate.getFullYear() &&
            mois > currentDate.getMonth() + 1) ? (
            <View className="mx-5 rounded-2xl bg-amber-50 border border-amber-200 p-3 flex-row items-center gap-2">
              <Ionicons name="warning" size={20} color="#856404" />
              <Text className="text-amber-800">
                Vous ajoutez du CA pour un mois futur
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}
