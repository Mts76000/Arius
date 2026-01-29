import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Rdv, CreateRdvInput, RdvStatus } from "@/services/rdvs";
import { Entreprise } from "@/services/entreprises";
import { Contact } from "@/services/contacts";
import { ValidationRules, FormErrors } from "@/utils/validation";
import { styles } from "@/styles/entrepriseDetailStyles";

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

const DURATIONS = [15, 30, 45, 60];

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
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ScrollView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} disabled={isLoading}>
            <Text style={styles.modalClose}>Annuler</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {rdv ? "Modifier RDV" : "Nouveau RDV"}
          </Text>
          <TouchableOpacity onPress={handleSubmit} disabled={isLoading}>
            <Text style={[styles.modalSave, isLoading && { opacity: 0.5 }]}>
              {isLoading ? "..." : "Enregistrer"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modalForm}>
          {/* Entreprise */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Entreprise</Text>
            {Platform.OS === "web" ? (
              <View
                style={[
                  styles.input,
                  { paddingVertical: 0, paddingHorizontal: 0 },
                  errors.entreprise_id && { borderColor: "#ef4444" },
                ]}
              >
                <select
                  value={selectedEntrepriseId}
                  onChange={(e: any) => setSelectedEntrepriseId(e.target.value)}
                  disabled={isLoading}
                  style={{
                    height: 50,
                    width: "100%",
                    border: "none",
                    outline: "none",
                  }}
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
              <View
                style={[
                  styles.input,
                  errors.entreprise_id && { borderColor: "#ef4444" },
                ]}
              >
                <Picker
                  selectedValue={selectedEntrepriseId}
                  onValueChange={(value) => setSelectedEntrepriseId(value)}
                  enabled={!isLoading}
                  style={{
                    height: 50,
                    width: "100%",
                    marginTop: -8,
                    marginBottom: -8,
                  }}
                >
                  <Picker.Item label="Sélectionner une entreprise" value="" />
                  {entreprises?.map((e) => (
                    <Picker.Item key={e.id} label={e.nom} value={e.id} />
                  ))}
                </Picker>
              </View>
            )}
            {errors.entreprise_id && (
              <Text style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
                {errors.entreprise_id}
              </Text>
            )}
          </View>

          {/* Contact - Only show if enterprise selected and has contacts */}
          {selectedEntrepriseId &&
            contacts?.filter((c) => c.entreprise_id === selectedEntrepriseId)
              .length > 0 && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Contact (optionnel)</Text>
                {Platform.OS === "web" ? (
                  <View
                    style={[
                      styles.input,
                      { paddingVertical: 0, paddingHorizontal: 0 },
                    ]}
                  >
                    <select
                      value={selectedContactId}
                      onChange={(e: any) =>
                        setSelectedContactId(e.target.value)
                      }
                      disabled={isLoading}
                      style={{
                        height: 50,
                        width: "100%",
                        border: "none",
                        outline: "none",
                      }}
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
                  <View style={styles.input}>
                    <Picker
                      selectedValue={selectedContactId}
                      onValueChange={(value) => setSelectedContactId(value)}
                      enabled={!isLoading}
                      style={{
                        height: 50,
                        width: "100%",
                        marginTop: -8,
                        marginBottom: -8,
                      }}
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
              </View>
            )}

          {/* Status */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Statut</Text>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {[
                { value: "planifie" as RdvStatus, label: "📅 Prévu" },
                { value: "termine" as RdvStatus, label: "✓ Terminé" },
                { value: "annule" as RdvStatus, label: "✕ Annulé" },
              ].map((status) => (
                <TouchableOpacity
                  key={status.value}
                  onPress={() => setSelectedStatus(status.value)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor:
                      selectedStatus === status.value
                        ? status.value === "planifie"
                          ? "#3b82f6"
                          : status.value === "termine"
                            ? "#10b981"
                            : "#ef4444"
                        : "#e5e7eb",
                  }}
                >
                  <Text
                    style={{
                      color:
                        selectedStatus === status.value ? "#ffffff" : "#374151",
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Titre */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Titre</Text>
            <TextInput
              style={[styles.input, errors.titre && { borderColor: "#ef4444" }]}
              placeholder="Ex: Réunion de présentation"
              value={titre}
              onChangeText={setTitre}
              editable={!isLoading}
            />
            {errors.titre && (
              <Text style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
                {errors.titre}
              </Text>
            )}
          </View>

          {/* Date */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Date et Heure</Text>
            {Platform.OS === "web" ? (
              <View style={{ flexDirection: "row", gap: 8 }}>
                <input
                  type="date"
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
                  style={{ ...styles.input, flex: 1 }}
                />
                <input
                  type="time"
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
                  style={{ ...styles.input, flex: 1 }}
                />
              </View>
            ) : (
              <View>
                <View style={{ marginBottom: 12 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      marginBottom: 4,
                      fontWeight: "600",
                    }}
                  >
                    Date
                  </Text>
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) setDate(selectedDate);
                    }}
                  />
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      marginBottom: 4,
                      fontWeight: "600",
                    }}
                  >
                    Heure
                  </Text>
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
          </View>

          {/* Duration */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Durée</Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 12,
              }}
            >
              {DURATIONS.map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setDuree(d)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor: duree === d ? "#2563eb" : "#e5e7eb",
                  }}
                >
                  <Text
                    style={{
                      color: duree === d ? "#ffffff" : "#374151",
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    {d} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ marginTop: 4 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: "#64748b",
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                Durée personnalisée (en minutes)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    fontSize: 14,
                  },
                ]}
                placeholder="Ex: 90"
                value={!DURATIONS.includes(duree) ? duree.toString() : ""}
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
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Notes supplémentaires (optionnel)"
              multiline
              numberOfLines={4}
              editable={!isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
}
