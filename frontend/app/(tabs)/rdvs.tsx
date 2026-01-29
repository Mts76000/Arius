import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import {
  useMyRdvs,
  useCreateRdv,
  useUpdateRdv,
  useDeleteRdv,
} from "@/hooks/useRdvs";
import { useEntreprises } from "@/hooks/useEntreprises";
import { useContacts } from "@/hooks/useContacts";
import { Rdv, CreateRdvInput, RdvStatus } from "@/services/rdvs";
import { Contact } from "@/services/contacts";
import { RdvCard } from "@/components/RdvCard";
import { RdvModal } from "@/components/RdvModal";
import { styles } from "@/styles/entrepriseDetailStyles";

type DateFilter = "today" | "week" | "month" | "all";

export default function RdvsScreen() {
  const router = useRouter();
  const { data: rdvsResponse, isLoading } = useMyRdvs();
  const { data: entreprisesData } = useEntreprises();
  const rdvs = rdvsResponse?.rdvs || [];
  const entreprises = entreprisesData?.entreprises || [];

  const createRdvMutation = useCreateRdv();
  const updateRdvMutation = useUpdateRdv();
  const deleteRdvMutation = useDeleteRdv();

  const [showRdvModal, setShowRdvModal] = useState(false);
  const [selectedRdv, setSelectedRdv] = useState<Rdv | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);

  // Charger les contacts pour chaque entreprise
  const firstEntrepriseId = entreprises?.[0]?.id;
  const { data: firstEntrepriseContacts } = useContacts(
    firstEntrepriseId || "",
  );
  const secondEntrepriseId = entreprises?.[1]?.id;
  const { data: secondEntrepriseContacts } = useContacts(
    secondEntrepriseId || "",
  );
  const thirdEntrepriseId = entreprises?.[2]?.id;
  const { data: thirdEntrepriseContacts } = useContacts(
    thirdEntrepriseId || "",
  );
  const fourthEntrepriseId = entreprises?.[3]?.id;
  const { data: fourthEntrepriseContacts } = useContacts(
    fourthEntrepriseId || "",
  );
  const fifthEntrepriseId = entreprises?.[4]?.id;
  const { data: fifthEntrepriseContacts } = useContacts(
    fifthEntrepriseId || "",
  );

  // Compiler tous les contacts
  React.useEffect(() => {
    const contacts: Contact[] = [];
    if (firstEntrepriseContacts) contacts.push(...firstEntrepriseContacts);
    if (secondEntrepriseContacts) contacts.push(...secondEntrepriseContacts);
    if (thirdEntrepriseContacts) contacts.push(...thirdEntrepriseContacts);
    if (fourthEntrepriseContacts) contacts.push(...fourthEntrepriseContacts);
    if (fifthEntrepriseContacts) contacts.push(...fifthEntrepriseContacts);
    setAllContacts(contacts);
  }, [
    firstEntrepriseContacts,
    secondEntrepriseContacts,
    thirdEntrepriseContacts,
    fourthEntrepriseContacts,
    fifthEntrepriseContacts,
  ]);

  const getEntrepriseNameById = (id: string) => {
    return entreprises?.find((e: any) => e.id === id)?.nom || "Entreprise";
  };

  const filteredRdvs = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Pour la semaine : du lundi au dimanche de la semaine en cours
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si dimanche (0), on recule de 6 jours, sinon on calcule la distance au lundi
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + diffToMonday);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Pour le mois : début et fin du mois en cours
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    return rdvs.filter((rdv) => {
      const rdvDate = new Date(rdv.date_prevue);

      // Custom date filter
      if (selectedDate) {
        return rdvDate.toDateString() === selectedDate.toDateString();
      }

      // Quick filters
      switch (dateFilter) {
        case "today":
          return rdvDate.toDateString() === today.toDateString();
        case "week":
          return rdvDate >= weekStart && rdvDate <= weekEnd;
        case "month":
          return rdvDate >= monthStart && rdvDate <= monthEnd;
        case "all":
        default:
          return true;
      }
    });
  }, [rdvs, dateFilter, selectedDate]);

  // Trier par date (à venir d'abord)
  const sortedRdvs = [...filteredRdvs].sort(
    (a, b) =>
      new Date(a.date_prevue).getTime() - new Date(b.date_prevue).getTime(),
  );

  const handleAddRdv = () => {
    setSelectedRdv(null);
    setShowRdvModal(true);
  };

  const handleEditRdv = (rdv: Rdv) => {
    setSelectedRdv(rdv);
    setShowRdvModal(true);
  };

  const handleDeleteRdv = (rdvId: string) => {
    const doDelete = async () => {
      try {
        await deleteRdvMutation.mutateAsync(rdvId);
      } catch (error) {
        Alert.alert("Erreur", "Impossible de supprimer le RDV");
      }
    };

    if (Platform.OS === "web") {
      const ok = window.confirm("Êtes-vous sûr de vouloir supprimer ce RDV ?");
      if (ok) doDelete();
      return;
    }

    Alert.alert(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer ce RDV ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: doDelete,
        },
      ],
    );
  };

  const handleChangeStatus = async (rdvId: string, status: RdvStatus) => {
    try {
      await updateRdvMutation.mutateAsync({
        id: rdvId,
        updates: { statut: status },
      });
    } catch (error) {
      Alert.alert("Erreur", "Impossible de mettre à jour le RDV");
    }
  };

  const handleSubmitRdv = async (data: CreateRdvInput) => {
    try {
      if (selectedRdv) {
        await updateRdvMutation.mutateAsync({
          id: selectedRdv._id,
          updates: data,
        });
      } else {
        await createRdvMutation.mutateAsync(data);
      }
      setShowRdvModal(false);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de sauvegarder le RDV");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View
        style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}
      >
        <Text style={{ fontSize: 28, fontWeight: "800", color: "#0f172a" }}>
          📅 Rendez-vous
        </Text>
      </View>

      {/* Add Button */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <TouchableOpacity
          onPress={handleAddRdv}
          style={{
            backgroundColor: "#0ea5e9",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 16 }}>
            + Créer un RDV
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        {/* Quick Filters */}
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 12,
          }}
        >
          {[
            { value: "today", label: "Aujourd'hui" },
            { value: "week", label: "Cette semaine" },
            { value: "month", label: "Ce mois" },
            { value: "all", label: "Tous" },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.value}
              onPress={() => {
                setDateFilter(filter.value as DateFilter);
                setSelectedDate(null);
              }}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor:
                  dateFilter === filter.value && !selectedDate
                    ? "#0ea5e9"
                    : "#e5e7eb",
              }}
            >
              <Text
                style={{
                  color:
                    dateFilter === filter.value && !selectedDate
                      ? "#ffffff"
                      : "#374151",
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Input */}
        <View>
          <Text
            style={{
              fontSize: 12,
              color: "#64748b",
              marginBottom: 4,
              fontWeight: "600",
            }}
          >
            Ou sélectionnez une date
          </Text>
          {Platform.OS === "web" ? (
            <input
              type="date"
              value={
                selectedDate ? selectedDate.toISOString().split("T")[0] : ""
              }
              onChange={(e: any) => {
                if (e.target.value) {
                  setSelectedDate(new Date(e.target.value));
                } else {
                  setSelectedDate(null);
                }
              }}
              style={{
                backgroundColor: "#f1f5f9",
                borderRadius: 10,
                paddingLeft: 12,
                paddingRight: 12,
                paddingTop: 10,
                paddingBottom: 10,
                border: selectedDate
                  ? "1px solid #0ea5e9"
                  : "1px solid #e5e7eb",
                fontSize: 14,
                width: "100%",
              }}
            />
          ) : (
            <View>
              <Text
                style={{
                  fontSize: 12,
                  color: "#64748b",
                  marginBottom: 4,
                  fontWeight: "600",
                }}
              >
                Sélectionner une date
              </Text>
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  if (date) setSelectedDate(date);
                }}
              />
              {selectedDate && (
                <TouchableOpacity
                  onPress={() => setSelectedDate(null)}
                  style={{ marginTop: 12, alignSelf: "center" }}
                >
                  <Text
                    style={{
                      color: "#ef4444",
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    Effacer le filtre
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      {/* RDVs List */}
      {isLoading ? (
        <View style={{ paddingTop: 40 }}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      ) : sortedRdvs.length > 0 ? (
        <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          <View style={{ gap: 12 }}>
            {sortedRdvs.map((rdv) => (
              <RdvCard
                key={rdv._id}
                rdv={rdv}
                entrepriseName={getEntrepriseNameById(rdv.entreprise_id)}
                onEdit={() => handleEditRdv(rdv)}
                onDelete={() => handleDeleteRdv(rdv._id)}
                onChangeStatus={(status) => handleChangeStatus(rdv._id, status)}
              />
            ))}
          </View>
        </View>
      ) : (
        <View
          style={{
            alignItems: "center",
            paddingVertical: 60,
            paddingHorizontal: 16,
          }}
        >
          <Text style={{ fontSize: 48, marginBottom: 12 }}>📅</Text>
          <Text
            style={{
              color: "#0f172a",
              fontWeight: "700",
              fontSize: 16,
              marginBottom: 6,
            }}
          >
            Aucun rendez-vous
          </Text>
          <Text
            style={{
              color: "#64748b",
              fontSize: 14,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            Planifie un rendez-vous avec tes clients
          </Text>
          <TouchableOpacity
            onPress={handleAddRdv}
            style={{
              backgroundColor: "#0ea5e9",
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "#ffffff", fontWeight: "700" }}>
              + Créer un RDV
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <RdvModal
        visible={showRdvModal}
        rdv={selectedRdv}
        entrepriseId={selectedRdv ? undefined : ""}
        entreprises={entreprises}
        contacts={allContacts}
        onSubmit={handleSubmitRdv}
        onClose={() => setShowRdvModal(false)}
        isLoading={createRdvMutation.isPending || updateRdvMutation.isPending}
      />
    </ScrollView>
  );
}
