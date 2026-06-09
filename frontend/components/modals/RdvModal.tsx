import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  ScrollView,
  View,
  Text,
  Alert,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Rdv, CreateRdvInput, RdvStatus } from "@/services/rdvs";
import { Entreprise } from "@/services/entreprises";
import { Contact } from "@/services/contacts";
import { FormErrors } from "@/utils/validation";
import { FormInput } from "@/components/forms/FormInput";
import {
  ChoiceChip,
  FormGroup,
  FormHeader,
  Form,
  PickerFrame,
} from "@/components/forms/Form";
import {
  getFormModalPresentationStyle,
  RDV_DURATION_OPTIONS,
  RDV_STATUS_OPTIONS,
} from "@/components/forms/formDefinitions";
import { getRdvStatusConfig } from "@/utils/rdvStatus";

interface RdvModalProps {
  visible: boolean;
  rdv?: Rdv | null;
  entrepriseId?: string;
  entreprises: Entreprise[];
  contacts: Contact[];
  onSubmit: (data: CreateRdvInput) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export function RdvModal({
  visible,
  rdv,
  entrepriseId,
  entreprises,
  contacts,
  onSubmit,
  onClose,
  isLoading = false,
}: RdvModalProps) {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [duree, setDuree] = useState(30);
  const [selectedEntrepriseId, setSelectedEntrepriseId] = useState("");
  const [selectedContactId, setSelectedContactId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<RdvStatus>("planifie");
  const [errors, setErrors] = useState<FormErrors>({});
  const initializedRef = useRef(false);

  useEffect(() => {
    if (visible && !initializedRef.current) {
      initializedRef.current = true;
      if (rdv) {
        setTitre(rdv.titre);
        setDescription(rdv.description || "");
        setSelectedEntrepriseId(rdv.entreprise_id);
        setSelectedContactId(rdv.contact_id || "");
        setDate(new Date(rdv.date_prevue));
        setDuree(rdv.duree_minutes);
        setSelectedStatus(rdv.statut);
      } else {
        setTitre("");
        setDescription("");
        setSelectedEntrepriseId(entrepriseId || "");
        setSelectedContactId("");
        setDate(new Date());
        setDuree(30);
        setSelectedStatus("planifie");
        setErrors({});
      }
    }

    if (!visible) {
      initializedRef.current = false;
    }
  }, [rdv, visible, entrepriseId]);

  const handleSubmit = async () => {
    const newErrors: FormErrors = {};

    if (!titre.trim()) {
      newErrors.titre = "Titre requis";
    }

    if (!selectedEntrepriseId) {
      newErrors.entreprise_id = "Entreprise requise";
    }

    setErrors(newErrors);

    if (Object.values(newErrors).some((e) => e !== null)) {
      return;
    }

    const data: CreateRdvInput = {
      titre: titre.trim(),
      description: description.trim() || undefined,
      date_prevue: date.toISOString(),
      duree_minutes: duree,
      entreprise_id: selectedEntrepriseId,
      contact_id: selectedContactId || undefined,
      statut: selectedStatus,
    };

    try {
      await onSubmit(data);
      setTitre("");
      setDescription("");
      setSelectedEntrepriseId("");
      setSelectedContactId("");
      setDate(new Date());
      setDuree(30);
      setSelectedStatus("planifie");
      setErrors({});
    } catch {
      Alert.alert("Erreur", "Impossible de sauvegarder le RDV");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={getFormModalPresentationStyle("rdv")}
      onRequestClose={onClose}
    >
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <FormHeader
          title={rdv ? "Modifier le rendez-vous" : "Nouveau rendez-vous"}
          onCancel={onClose}
          onSave={handleSubmit}
          isSaving={isLoading}
          cancelDisabled={isLoading}
          saveDisabled={isLoading}
        />

        <Form>
          {/* Entreprise */}
          <FormGroup title="Entreprise" error={errors.entreprise_id}>
            {Platform.OS === "web" ? (
              <PickerFrame error={!!errors.entreprise_id}>
                <select
                  className="w-full bg-transparent outline-none py-3 px-3 text-gray-900"
                  value={selectedEntrepriseId}
                  onChange={(e: any) => setSelectedEntrepriseId(e.target.value)}
                  disabled={isLoading}
                >
                  <option key="select-empty" value="">
                    Sélectionner une entreprise
                  </option>
                  {entreprises?.map((e) => (
                    <option key={`select-${e.id}`} value={e.id}>
                      {e.nom}
                    </option>
                  ))}
                </select>
              </PickerFrame>
            ) : (
              <PickerFrame error={!!errors.entreprise_id}>
                <Picker
                  selectedValue={selectedEntrepriseId}
                  onValueChange={(value) => setSelectedEntrepriseId(value)}
                  enabled={!isLoading}
                >
                  <Picker.Item label="Sélectionner une entreprise" value="" />
                  {entreprises?.map((e) => (
                    <Picker.Item key={e.id} label={e.nom} value={e.id} />
                  ))}
                </Picker>
              </PickerFrame>
            )}
          </FormGroup>

          {/* Contact - Only show if enterprise selected and has contacts */}
          {selectedEntrepriseId &&
            contacts?.filter((c) => c.entreprise_id === selectedEntrepriseId)
              .length > 0 && (
              <FormGroup title="Contact (optionnel)">
                {Platform.OS === "web" ? (
                  <PickerFrame>
                    <select
                      className="w-full bg-transparent outline-none py-3 px-3 text-gray-900"
                      value={selectedContactId}
                      onChange={(e: any) =>
                        setSelectedContactId(e.target.value)
                      }
                      disabled={isLoading}
                    >
                      <option key="select-contact-empty" value="">
                        Sélectionner un contact (optionnel)
                      </option>
                      {contacts
                        ?.filter(
                          (c) => c.entreprise_id === selectedEntrepriseId,
                        )
                        .map((c) => (
                          <option key={`select-contact-${c.id}`} value={c.id}>
                            {c.prenom && c.nom ? `${c.prenom} ${c.nom}` : c.nom}
                          </option>
                        ))}
                    </select>
                  </PickerFrame>
                ) : (
                  <PickerFrame>
                    <Picker
                      selectedValue={selectedContactId}
                      onValueChange={(value) => setSelectedContactId(value)}
                      enabled={!isLoading}
                    >
                      <Picker.Item
                        label="Sélectionner un contact (optionnel)"
                        value=""
                      />
                      {contacts
                        ?.filter(
                          (c) => c.entreprise_id === selectedEntrepriseId,
                        )
                        .map((c) => (
                          <Picker.Item
                            key={c.id}
                            label={
                              c.prenom && c.nom ? `${c.prenom} ${c.nom}` : c.nom
                            }
                            value={c.id}
                          />
                        ))}
                    </Picker>
                  </PickerFrame>
                )}
              </FormGroup>
            )}

          {/* Status */}
          <FormGroup title="Statut">
            <View className="flex-row flex-wrap gap-2">
              {[...RDV_STATUS_OPTIONS].map((status) => {
                const statusConfig = getRdvStatusConfig(status.value);
                return (
                  <ChoiceChip
                    key={status.value}
                    label={status.label}
                    selected={selectedStatus === status.value}
                    onPress={() => setSelectedStatus(status.value)}
                    selectedClassName={`${statusConfig.badgeBgClass} border-transparent`}
                    selectedTextClassName={`${statusConfig.badgeTextClass} font-semibold`}
                    style={
                      selectedStatus === status.value
                        ? { backgroundColor: statusConfig.badgeBgColor }
                        : undefined
                    }
                    textStyle={
                      selectedStatus === status.value
                        ? { color: statusConfig.badgeTextColor }
                        : undefined
                    }
                  />
                );
              })}
            </View>
          </FormGroup>

          {/* Titre */}
          <FormGroup title="Titre" error={errors.titre}>
            <FormInput
              label=""
              placeholder="Ex: Réunion de présentation"
              value={titre}
              onChangeText={setTitre}
              editable={!isLoading}
              error={null}
            />
          </FormGroup>

          {/* Date */}
          <FormGroup title="Date et heure">
            {Platform.OS === "web" ? (
              <View className="flex-row gap-2">
                <input
                  type="date"
                  className="flex-1 rounded-2xl border border-gray-200 bg-white px-3 py-3 text-gray-900"
                  value={date.toISOString().split("T")[0]}
                  onChange={(e: any) => {
                    const newDate = new Date(date);
                    const [year, month, day] = e.target.value
                      .split("-")
                      .map(Number);
                    newDate.setFullYear(year, month - 1, day);
                    setDate(newDate);
                  }}
                  disabled={isLoading}
                />
                <input
                  type="time"
                  className="flex-1 rounded-2xl border border-gray-200 bg-white px-3 py-3 text-gray-900"
                  value={date.toTimeString().slice(0, 5)}
                  onChange={(e: any) => {
                    const newDate = new Date(date);
                    const [hours, minutes] = e.target.value
                      .split(":")
                      .map(Number);
                    newDate.setHours(hours, minutes);
                    setDate(newDate);
                  }}
                  disabled={isLoading}
                />
              </View>
            ) : (
              <View className="gap-3">
                <View className="rounded-2xl border border-gray-200 bg-white px-2">
                  <Text className="text-xs text-gray-500 px-2 pt-2">Date</Text>
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) setDate(selectedDate);
                    }}
                  />
                </View>
                <View className="rounded-2xl border border-gray-200 bg-white px-2">
                  <Text className="text-xs text-gray-500 px-2 pt-2">Heure</Text>
                  <DateTimePicker
                    value={date}
                    mode="time"
                    display="default"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) setDate(selectedDate);
                    }}
                  />
                </View>
              </View>
            )}
          </FormGroup>

          {/* Duration */}
          <FormGroup title="Durée">
            <View className="flex-row flex-wrap gap-2">
              {RDV_DURATION_OPTIONS.map((d) => (
                <ChoiceChip
                  key={d}
                  label={`${d} min`}
                  selected={duree === d}
                  onPress={() => setDuree(d)}
                />
              ))}
            </View>
            <View className="gap-2">
              <Text className="text-sm font-medium text-gray-700">
                Durée personnalisée (en minutes)
              </Text>
              <FormInput
                label=""
                placeholder="Ex: 90"
                value={
                  !RDV_DURATION_OPTIONS.includes(
                    duree as (typeof RDV_DURATION_OPTIONS)[number],
                  )
                    ? duree.toString()
                    : ""
                }
                onChangeText={(value) => {
                  if (value === "") {
                    setDuree(30);
                    return;
                  }
                  const num = parseInt(value);
                  if (!isNaN(num) && num > 0) {
                    setDuree(num);
                  }
                }}
                keyboardType="number-pad"
                editable={!isLoading}
                error={null}
              />
            </View>
          </FormGroup>

          {/* Description */}
          <FormGroup title="Description">
            <FormInput
              label=""
              value={description}
              onChangeText={setDescription}
              placeholder="Notes supplémentaires (optionnel)"
              multiline
              numberOfLines={4}
              editable={!isLoading}
              error={null}
            />
          </FormGroup>
        </Form>
      </ScrollView>
    </Modal>
  );
}
