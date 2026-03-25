import React from "react";
import { View, Text, TouchableOpacity, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Rdv, RdvStatus } from "@/services/rdvs";
import { getNextRdvStatuses, getRdvStatusConfig } from "@/utils/rdvStatus";
import { ActionMenu } from "@/components/ui/ActionMenu";

interface RdvCardProps {
  rdv: Rdv;
  entrepriseName?: string;
  contactName?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onChangeStatus?: (status: RdvStatus) => void;
}

export const RdvCard: React.FC<RdvCardProps> = ({
  rdv,
  entrepriseName,
  contactName,
  onEdit,
  onDelete,
  onChangeStatus,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow =
      new Date(now.getTime() + 86400000).toDateString() === date.toDateString();

    let dayPart = "";
    if (isToday) {
      dayPart = "Aujourd'hui";
    } else if (isTomorrow) {
      dayPart = "Demain";
    } else {
      dayPart = date.toLocaleDateString("fr-FR", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }

    const time = date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return { day: dayPart, time };
  };

  const { day, time } = formatDate(rdv.date_prevue);
  const statusConfig = getRdvStatusConfig(rdv.statut);
  const availableTransitions = getNextRdvStatuses(rdv.statut);

  return (
    <Pressable className="relative rounded-2xl border border-slate-100 bg-slate-50 p-4 flex-col gap-2 ">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 flex-row items-start gap-3">
          <View className="flex-1 gap-2">
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-bold " numberOfLines={1}>
                {rdv.titre}
              </Text>
              <View
                className={`${statusConfig.badgeBgClass} rounded-full px-2 py-1`}
              >
                <Text
                  className={`text-xs font-bold ${statusConfig.badgeTextClass}`}
                >
                  {statusConfig.label}
                </Text>
              </View>
            </View>

            {entrepriseName && (
              <Text
                className="text-sm font-medium text-slate-500"
                numberOfLines={1}
              >
                {entrepriseName}
              </Text>
            )}

            {contactName ? (
              <View className="mt-0.5 flex-row items-center gap-1.5">
                <Ionicons name="person-outline" size={13} color="#64748B" />
                <Text className=" font-medium text-slate-500" numberOfLines={1}>
                  {contactName}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <ActionMenu useModal menuWidth={190}>
          {({ close }) => (
            <>
              {availableTransitions.length > 0 && onChangeStatus ? (
                <>
                  <Text className="px-3 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Changer le statut
                  </Text>

                  {availableTransitions.map((nextStatus) => {
                    const nextConfig = getRdvStatusConfig(nextStatus);

                    return (
                      <TouchableOpacity
                        key={nextStatus}
                        className="flex-row items-center gap-2 rounded-xl px-3 py-2"
                        onPress={() => {
                          close();
                          onChangeStatus(nextStatus);
                        }}
                      >
                        <Ionicons
                          name={nextConfig.icon as any}
                          size={16}
                          color={nextConfig.iconColor}
                        />
                        <Text
                          className={`text-sm font-medium ${nextConfig.badgeTextClass}`}
                        >
                          {nextConfig.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                  {onEdit || onDelete ? (
                    <View className="my-1 h-px bg-slate-200" />
                  ) : null}
                </>
              ) : null}

              {onEdit ? (
                <TouchableOpacity
                  className="flex-row items-center gap-2 rounded-xl px-3 py-2"
                  onPress={() => {
                    close();
                    onEdit();
                  }}
                >
                  <Ionicons name="pencil-outline" size={16} color="#3B82F6" />
                  <Text className="text-sm font-medium text-slate-700">
                    Modifier
                  </Text>
                </TouchableOpacity>
              ) : null}

              {onDelete ? (
                <TouchableOpacity
                  className="flex-row items-center gap-2 rounded-xl px-3 py-2"
                  onPress={() => {
                    close();
                    onDelete();
                  }}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  <Text className="text-sm font-medium text-red-500">
                    Supprimer
                  </Text>
                </TouchableOpacity>
              ) : null}
            </>
          )}
        </ActionMenu>
      </View>

      <View className="mt-3 w-full gap-2">
        <View className="flex-row items-center gap-2">
          <Ionicons name="calendar-outline" size={16} color="#007aff" />
          <Text className="font-medium text-slate-700">{day}</Text>
          <Text className="text-slate-300">•</Text>
          <Ionicons name="time-outline" size={16} color="#007aff" />
          <Text className="font-medium text-slate-700">{time}</Text>
          <Text className="text-slate-300">•</Text>
          <Ionicons name="hourglass-outline" size={16} color="#007aff" />
          <Text className="font-medium text-slate-700">
            {rdv.duree_minutes}m
          </Text>
        </View>

        {rdv.description && (
          <Text className="text-sm text-slate-600" numberOfLines={2}>
            {rdv.description}
          </Text>
        )}
      </View>
    </Pressable>
  );
};
