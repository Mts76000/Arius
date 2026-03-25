import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
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
import { FormGroup, FormHeader, Form } from "@/components/forms/Form";
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
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
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
          title={rdv ? "Modifier RDV" : "Nouveau RDV"}
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
              <View className="rounded-2xl border border-gray-300 bg-gray-50 px-1">
                <select
                  className="w-full bg-transparent outline-none py-3 px-2 text-gray-900"
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
              </View>
            ) : (
              <View className="rounded-2xl border border-gray-300 bg-gray-50 overflow-hidden">
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
              </View>
            )}
          </FormGroup>

          {/* Contact - Only show if enterprise selected and has contacts */}
          {selectedEntrepriseId &&
            contacts?.filter((c) => c.entreprise_id === selectedEntrepriseId)
              .length > 0 && (
              <FormGroup title="Contact (optionnel)">
                {Platform.OS === "web" ? (
                  <View className="rounded-2xl border border-gray-300 bg-gray-50 px-1">
                    <select
                      className="w-full bg-transparent outline-none py-3 px-2 text-gray-900"
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
                  </View>
                ) : (
                  <View className="rounded-2xl border border-gray-300 bg-gray-50 overflow-hidden">
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
                  </View>
                )}
              </FormGroup>
            )}

          {/* Status */}
          <FormGroup title="Statut">
            <View className="flex-row flex-wrap gap-2">
              {[...RDV_STATUS_OPTIONS].map((status) => {
                const statusConfig = getRdvStatusConfig(status.value);
                return (
                  <TouchableOpacity
                    key={status.value}
                    onPress={() => setSelectedStatus(status.value)}
                    className={`rounded-full border px-4 py-2 ${selectedStatus === status.value ? statusConfig.badgeBgClass : "bg-white border-gray-300"}`}
                    style={
                      selectedStatus === status.value
                        ? { backgroundColor: statusConfig.badgeBgColor }
                        : undefined
                    }
                  >
                    <Text
                      className={
                        selectedStatus === status.value
                          ? `${statusConfig.badgeTextClass} font-semibold`
                          : "text-gray-700"
                      }
                      style={
                        selectedStatus === status.value
                          ? { color: statusConfig.badgeTextColor }
                          : undefined
                      }
                    >
                      {status.label}
                    </Text>
                  </TouchableOpacity>
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
                  className="flex-1 rounded-2xl border border-gray-300 bg-gray-50 px-3 py-3 text-gray-900"
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
                  className="flex-1 rounded-2xl border border-gray-300 bg-gray-50 px-3 py-3 text-gray-900"
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
                <View className="rounded-2xl border border-gray-300 bg-gray-50 px-2">
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
                <View className="rounded-2xl border border-gray-300 bg-gray-50 px-2">
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
          <FormGroup title="Duree">
            <View className="flex-row flex-wrap gap-2">
              {RDV_DURATION_OPTIONS.map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setDuree(d)}
                  className={`rounded-full px-4 py-2 border ${duree === d ? "bg-primary border-primary" : "bg-white border-gray-300"}`}
                >
                  <Text
                    className={
                      duree === d ? "text-white font-semibold" : "text-gray-700"
                    }
                  >
                    {d} min
                  </Text>
                </TouchableOpacity>
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
