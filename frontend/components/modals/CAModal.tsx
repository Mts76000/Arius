import React, { useState, useEffect, useMemo } from "react";
import { Modal, View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Entreprise } from "@/services/entreprises";
import { FormInput } from "@/components/forms/FormInput";
import {
  FormGroup,
  FormHeader,
  FormSection,
} from "@/components/forms/Form";
import { NativeSelectField } from "@/components/forms/NativeSelectField";
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
  const currentDate = useMemo(() => new Date(), []);
  const annees = useMemo(
    () => [
      currentDate.getFullYear() - 2,
      currentDate.getFullYear() - 1,
      currentDate.getFullYear(),
      currentDate.getFullYear() + 1,
    ],
    [currentDate],
  );

  // Ensure anneeInitiale is in the list of available years
  const validAnnee = useMemo(
    () =>
      annees.includes(anneeInitiale || currentDate.getFullYear())
        ? anneeInitiale
        : currentDate.getFullYear(),
    [anneeInitiale, annees, currentDate],
  );

  const [entrepriseId, setEntrepriseId] = useState(entrepriseIdInitial || "");
  const [mois, setMois] = useState(moisInitial || currentDate.getMonth() + 1);
  const [annee, setAnnee] = useState(validAnnee || currentDate.getFullYear());
  const [ca, setCa] = useState(caInitial?.toString() || "");
  const entrepriseOptions = [
    { label: "Sélectionner une entreprise", value: "" },
    ...entreprises.map((entreprise) => ({
      label: entreprise.nom,
      value: entreprise.id,
    })),
  ];
  const moisOptions = MONTH_LABELS.map((moisLabel, index) => ({
    label: moisLabel,
    value: index + 1,
  }));
  const anneeOptions = annees.map((anneeOption) => ({
    label: anneeOption.toString(),
    value: anneeOption,
  }));

  useEffect(() => {
    if (visible) {
      setEntrepriseId(entrepriseIdInitial || "");
      setMois(moisInitial || currentDate.getMonth() + 1);
      setAnnee(validAnnee || currentDate.getFullYear());
      setCa(caInitial?.toString() || "");
    }
  }, [
    visible,
    entrepriseIdInitial,
    moisInitial,
    validAnnee,
    caInitial,
    currentDate,
  ]);

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
          <FormSection className="mt-4">
            <FormGroup title="Entreprise" required>
              <NativeSelectField
                value={entrepriseId}
                options={entrepriseOptions}
                onChange={setEntrepriseId}
                placeholder="Entreprise"
                disabled={isEditing}
              />
            </FormGroup>
          </FormSection>

          <FormSection>
            <FormGroup title="Mois" required>
              <NativeSelectField
                value={mois}
                options={moisOptions}
                onChange={setMois}
                placeholder="Mois"
                disabled={isEditing}
              />
            </FormGroup>
          </FormSection>

          <FormSection>
            <FormGroup title="Année" required>
              <NativeSelectField
                value={annee}
                options={anneeOptions}
                onChange={setAnnee}
                placeholder="Année"
                disabled={isEditing}
              />
            </FormGroup>
          </FormSection>

          <FormSection>
            <FormGroup title="Montant" required>
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
            </FormGroup>
          </FormSection>

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
