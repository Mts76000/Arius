import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  useWindowDimensions,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  useMyRdvs,
  useCreateRdv,
  useUpdateRdv,
  useDeleteRdv,
} from "@/hooks/useRdvs";
import { useEntreprises } from "@/hooks/useEntreprises";
import { useContacts } from "@/hooks/useContacts";
import { AppSpinner } from "@/components/ui/AppSpinner";
import { Rdv, CreateRdvInput, RdvStatus } from "@/services/rdvs";
import { Contact } from "@/services/contacts";
import { RdvCard } from "@/components/cards/RdvCard";
import { RdvModal } from "@/components/modals/RdvModal";
import { AppButton } from "@/components/ui/AppButton";
import { BtnPlus } from "@/components/ui/BtnPlus";

type DateFilter = "today" | "week" | "month" | "all" | "custom";
type TimelineFilter = "upcoming" | "past" | "all";
const PAGE_SIZE = 10;

interface RdvGroup {
  key: string;
  date: Date;
  items: Rdv[];
}

export default function RdvsScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const [page, setPage] = useState(1);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [timelineFilter, setTimelineFilter] =
    useState<TimelineFilter>("upcoming");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const queryFilters = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );
    const baseFilters: {
      page: number;
      limite: number;
      de?: string;
      a?: string;
    } = {
      page,
      limite: PAGE_SIZE,
    };

    let rangeStart: Date | undefined;
    let rangeEnd: Date | undefined;

    if (timelineFilter === "upcoming") {
      rangeStart = startOfToday;
    } else if (timelineFilter === "past") {
      rangeEnd = new Date(startOfToday.getTime() - 1);
    }

    const mergeRange = (nextStart?: Date, nextEnd?: Date) => {
      if (nextStart) {
        rangeStart =
          !rangeStart || nextStart > rangeStart ? nextStart : rangeStart;
      }
      if (nextEnd) {
        rangeEnd = !rangeEnd || nextEnd < rangeEnd ? nextEnd : rangeEnd;
      }
    };

    const buildDayRange = (date: Date) => {
      const start = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      const end = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        23,
        59,
        59,
        999,
      );
      return { start, end };
    };

    if (selectedDate) {
      const customRange = buildDayRange(selectedDate);
      mergeRange(customRange.start, customRange.end);
    } else if (dateFilter === "today") {
      const todayRange = buildDayRange(now);
      mergeRange(todayRange.start, todayRange.end);
    } else if (dateFilter === "week") {
      const dayOfWeek = now.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const weekStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      weekStart.setDate(weekStart.getDate() + diffToMonday);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      mergeRange(weekStart, weekEnd);
    } else if (dateFilter === "month") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      mergeRange(monthStart, monthEnd);
    }

    if (rangeStart) baseFilters.de = rangeStart.toISOString();
    if (rangeEnd) baseFilters.a = rangeEnd.toISOString();

    return baseFilters;
  }, [dateFilter, selectedDate, page, timelineFilter]);

  const { data: rdvsResponse, isLoading } = useMyRdvs(queryFilters);
  const { data: entreprisesData } = useEntreprises();
  const rdvs = rdvsResponse?.rdvs || [];
  const pagination = rdvsResponse?.pagination;
  const entreprises = entreprisesData?.entreprises || [];

  const createRdvMutation = useCreateRdv();
  const updateRdvMutation = useUpdateRdv();
  const deleteRdvMutation = useDeleteRdv();

  const [showRdvModal, setShowRdvModal] = useState(false);
  const [selectedRdv, setSelectedRdv] = useState<Rdv | null>(null);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);

  useEffect(() => {
    setPage(1);
  }, [dateFilter, selectedDate, timelineFilter]);

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

  const getContactNameById = (contactId?: string) => {
    if (!contactId) return undefined;

    const contact = allContacts.find((c) => c.id === contactId);
    if (!contact) return undefined;

    const fullName = `${contact.prenom || ""} ${contact.nom || ""}`.trim();
    return fullName || contact.nom || undefined;
  };

  // Trier logiquement: aujourd'hui/futurs proches d'abord, puis les RDV passés
  const sortedRdvs = [...rdvs].sort((a, b) => {
    const aDate = new Date(a.date_prevue);
    const bDate = new Date(b.date_prevue);

    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const isAUpcoming = aDate >= startOfToday;
    const isBUpcoming = bDate >= startOfToday;

    if (isAUpcoming !== isBUpcoming) {
      return isAUpcoming ? -1 : 1;
    }

    if (isAUpcoming) {
      return aDate.getTime() - bDate.getTime();
    }

    return bDate.getTime() - aDate.getTime();
  });

  const groupedRdvs = useMemo(() => {
    const groups = new Map<string, RdvGroup>();

    sortedRdvs.forEach((rdv) => {
      const date = new Date(rdv.date_prevue);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0",
      )}-${String(date.getDate()).padStart(2, "0")}`;

      const existingGroup = groups.get(key);
      if (existingGroup) {
        existingGroup.items.push(rdv);
        return;
      }

      groups.set(key, {
        key,
        date,
        items: [rdv],
      });
    });

    return Array.from(groups.values());
  }, [sortedRdvs]);

  const formatGroupDateLabel = (date: Date) => {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const dateStart = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    const diffInDays = Math.round(
      (dateStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffInDays === 0) return "Aujourd'hui";
    if (diffInDays === 1) return "Demain";
    if (diffInDays === -1) return "Hier";

    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

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
      } catch {
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
    } catch {
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
    } catch {
      Alert.alert("Erreur", "Impossible de sauvegarder le RDV");
    }
  };

  const totalPages = useMemo(() => {
    if (!pagination) return 1;
    return Math.max(1, Math.ceil(pagination.total / pagination.limite));
  }, [pagination]);

  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  return (
    <View className="flex-1 pt-8">
      <ScrollView
        contentContainerStyle={{
          alignSelf: "center",
          maxWidth: 1120,
          paddingBottom: isDesktop ? 48 : 180,
          paddingHorizontal: isDesktop ? 32 : 20,
          width: "100%",
        }}
      >
        {/* Action Button */}

        {/* Filters Section */}
        <View className="mb-6">
          {/* Quick Filters */}
          <Text className="mb-3 text-base font-semibold text-slate-900">
            Filtrer par date
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: 8,
              paddingRight: 20,
              alignItems: "center",
            }}
          >
            {[
              { value: "all", label: "Tous" },
              { value: "today", label: "Aujourd'hui" },
              { value: "week", label: "Cette semaine" },
              { value: "month", label: "Ce mois" },
              {
                value: "custom",
                label: selectedDate
                  ? selectedDate.toLocaleDateString("fr-FR")
                  : "Choisir une date",
              },
            ].map((filter) => {
              if (filter.value === "custom") {
                return (
                  <View
                    key={filter.value}
                    className="flex-row items-center gap-2"
                  >
                    {Platform.OS === "web" ? (
                      <input
                        type="date"
                        value={
                          selectedDate
                            ? selectedDate.toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e: any) => {
                          setDateFilter("custom");
                          if (e.target.value) {
                            setSelectedDate(new Date(e.target.value));
                          } else {
                            setSelectedDate(null);
                          }
                        }}
                        className="h-10 rounded-lg border border-slate-200 bg-transparent px-3 text-slate-900"
                      />
                    ) : (
                      <View className="h-10 justify-center rounded-lg  bg-transparent ">
                        <DateTimePicker
                          value={selectedDate || new Date()}
                          mode="date"
                          display={
                            Platform.OS === "ios" ? "compact" : "default"
                          }
                          onChange={(event, date) => {
                            setDateFilter("custom");
                            if (date) {
                              setSelectedDate(date);
                            }
                          }}
                        />
                      </View>
                    )}

                    {selectedDate && (
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedDate(null);
                          setDateFilter("all");
                        }}
                        className="h-10 px-3 rounded-lg border border-slate-200 bg-white items-center justify-center"
                      >
                        <Text className="text-sm font-semibold text-slate-700 text-center">
                          Effacer
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              }

              return (
                <TouchableOpacity
                  key={filter.value}
                  onPress={() => {
                    const nextFilter = filter.value as DateFilter;
                    setDateFilter(nextFilter);
                    setSelectedDate(null);
                  }}
                  className={`h-10 px-3 rounded-lg border items-center justify-center ${
                    dateFilter === filter.value
                      ? "border-primary bg-primary"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold whitespace-nowrap text-center ${
                      dateFilter === filter.value
                        ? "text-white"
                        : "text-slate-700"
                    }`}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text className="mt-3 mb-2 text-base font-semibold text-slate-900">
            Afficher
          </Text>

          <View className="flex-row gap-2">
            {[
              { value: "upcoming", label: "A venir" },
              { value: "past", label: "Passés" },
              { value: "all", label: "Tout" },
            ].map((filter) => {
              const isActive = timelineFilter === filter.value;
              return (
                <TouchableOpacity
                  key={filter.value}
                  onPress={() =>
                    setTimelineFilter(filter.value as TimelineFilter)
                  }
                  className={`h-10 px-4 rounded-lg border items-center justify-center ${
                    isActive
                      ? "border-primary bg-primary"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      isActive ? "text-white" : "text-slate-700"
                    }`}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* RDVs List */}
        {isLoading ? (
          <View className="flex-1 justify-center items-center py-20">
            <AppSpinner size="large" />
          </View>
        ) : sortedRdvs.length > 0 ? (
          <View className=" bg-white rounded-3xl p-5  flex-col gap-4">
            {groupedRdvs.map((group, groupIndex) => (
              <View
                key={group.key}
                className={`flex-col gap-3 ${groupIndex > 0 ? "mt-2" : ""}`}
              >
                <View className="rounded-xl border border-primary bg-primaryLight px-3 py-2">
                  <Text className="text-primary font-semibold text-sm capitalize">
                    {formatGroupDateLabel(group.date)}
                  </Text>
                </View>

                {group.items.map((rdv) => (
                  <RdvCard
                    key={rdv._id}
                    rdv={rdv}
                    entrepriseName={getEntrepriseNameById(rdv.entreprise_id)}
                    contactName={getContactNameById(rdv.contact_id)}
                    onEdit={() => handleEditRdv(rdv)}
                    onDelete={() => handleDeleteRdv(rdv._id)}
                    onChangeStatus={(status) =>
                      handleChangeStatus(rdv._id, status)
                    }
                  />
                ))}
              </View>
            ))}

            <View className="mt-2 pt-2 border-t border-grayLight flex-row items-center justify-between gap-3">
              <TouchableOpacity
                onPress={() =>
                  canGoPrev && setPage((prev) => Math.max(1, prev - 1))
                }
                disabled={!canGoPrev}
                className={`h-10 px-4 rounded-lg border items-center justify-center ${
                  canGoPrev
                    ? "border-primary bg-primary"
                    : "border-grayLight bg-gray-200"
                }`}
              >
                <Text
                  className={`font-semibold ${canGoPrev ? "text-white" : "text-gray"}`}
                >
                  Précédent
                </Text>
              </TouchableOpacity>

              <Text className="text-sm text-gray font-semibold">
                Page {page} / {totalPages}
              </Text>

              <TouchableOpacity
                onPress={() => canGoNext && setPage((prev) => prev + 1)}
                disabled={!canGoNext}
                className={`h-10 px-4 rounded-lg border items-center justify-center ${
                  canGoNext
                    ? "border-primary bg-primary"
                    : "border-grayLight bg-gray-200"
                }`}
              >
                <Text
                  className={`font-semibold ${canGoNext ? "text-white" : "text-gray"}`}
                >
                  Suivant
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : rdvs.length === 0 ? (
          <View className="items-center justify-center pt-16 pb-8">
            <Text className="text-lg font-semibold text-slate-900 mb-2">
              Aucun rendez-vous
            </Text>
            <Text className="text-sm text-slate-600 text-center mb-6">
              Crée ton premier RDV pour commencer
            </Text>
            <AppButton title="+ Créer un RDV" onPress={handleAddRdv} />
          </View>
        ) : (
          <View className="items-center justify-center pt-16 pb-8">
            <Text className="text-lg font-semibold text-slate-900 mb-2">
              Aucun RDV pour cette période
            </Text>
            <Text className="text-sm text-slate-600 text-center mb-6">
              Essaye un autre filtre de date
            </Text>
            <AppButton title="+ Créer un RDV" onPress={handleAddRdv} />
          </View>
        )}
      </ScrollView>

      <BtnPlus formType="rdv" onOpenRdv={handleAddRdv} />

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
    </View>
  );
}
