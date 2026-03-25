import React from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { Rdv, RdvStatus } from "@/services/rdvs";
import { Contact } from "@/services/contacts";
import { RdvCard } from "@/components/cards/RdvCard";

interface PaginationData {
  page: number;
  limite: number;
  total: number;
}

interface RdvGroup {
  key: string;
  date: Date;
  items: Rdv[];
}

interface RdvsTabProps {
  rdvs: Rdv[] | undefined;
  contacts?: Contact[];
  pagination?: PaginationData;
  page: number;
  rdvsLoading: boolean;
  onAddRdv: () => void;
  onEditRdv: (rdv: Rdv) => void;
  onDeleteRdv: (rdvId: string) => void;
  onChangeStatus: (rdvId: string, status: RdvStatus) => void;
  onPageChange: (page: number) => void;
}

export const RdvsTab: React.FC<RdvsTabProps> = ({
  rdvs,
  contacts,
  pagination,
  page,
  rdvsLoading,
  onAddRdv,
  onEditRdv,
  onDeleteRdv,
  onChangeStatus,
  onPageChange,
}) => {
  const getContactNameById = (contactId?: string) => {
    if (!contactId) return undefined;

    const contact = contacts?.find((c) => c.id === contactId);
    if (!contact) return undefined;

    const fullName = `${contact.prenom || ""} ${contact.nom || ""}`.trim();
    return fullName || contact.nom || undefined;
  };

  const sortedRdvs = [...(rdvs || [])].sort((a, b) => {
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

  const groupedRdvs = React.useMemo(() => {
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
      } else {
        groups.set(key, { key, date, items: [rdv] });
      }
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

  const totalPages = pagination
    ? Math.max(1, Math.ceil(pagination.total / pagination.limite))
    : 1;
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  return (
    <View className="p-5">
      <View className="flex flex-row justify-between pt-5">
        <Text className="text-lg font-bold">Rendez-vous</Text>
        <TouchableOpacity onPress={onAddRdv}>
          <Text className="text-primary font-semibold text-lg">+ Ajouter</Text>
        </TouchableOpacity>
      </View>
      {rdvsLoading ? (
        <ActivityIndicator size="small" color="#0ea5e9" />
      ) : rdvs && rdvs.length > 0 ? (
        <View className="bg-white rounded-3xl p-5 mt-5 flex-col gap-4 ">
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
                  contactName={getContactNameById(rdv.contact_id)}
                  onEdit={() => onEditRdv(rdv)}
                  onDelete={() => onDeleteRdv(rdv._id)}
                  onChangeStatus={(status) => onChangeStatus(rdv._id, status)}
                />
              ))}
            </View>
          ))}

          <View className="mt-2 pt-2 border-t border-grayLight flex-row items-center justify-between gap-3">
            <TouchableOpacity
              onPress={() => canGoPrev && onPageChange(Math.max(1, page - 1))}
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
              onPress={() => canGoNext && onPageChange(page + 1)}
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
      ) : (
        <View className="bg-primary rounded-3xl p-4 mt-8 flex items-center w-1/2 self-center">
          <Text className="text-white font-bold">Aucun RDV</Text>
        </View>
      )}
    </View>
  );
};
