import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/authStore";
import { useMyRdvs } from "@/hooks/useRdvs";
import { useContact } from "@/hooks/useContacts";
import { useEntreprises } from "@/hooks/useEntreprises";
import { AppButton } from "@/components/ui/AppButton";
import { BtnPlus } from "@/components/ui/BtnPlus";
import { getRdvStatusConfig } from "@/utils/rdvStatus";

export default function HomeScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const nowIso = useMemo(() => new Date().toISOString(), []);

  const rdvFilters = useMemo(
    () => ({
      de: nowIso,
      limite: 3,
    }),
    [nowIso],
  );

  const {
    data: rdvsData,
    isLoading: isLoadingRdvs,
    refetch: refetchRdvs,
  } = useMyRdvs(rdvFilters);
  const { data: allEntreprisesData } = useEntreprises();

  const refreshing = isLoadingRdvs;

  const rdvs = rdvsData?.rdvs || [];
  const upcomingRdvs = [...rdvs]
    .sort(
      (a, b) =>
        new Date(a.date_prevue).getTime() - new Date(b.date_prevue).getTime(),
    )
    .slice(0, 3);

  const firstRdvContactId = upcomingRdvs[0]?.contact_id || "";
  const secondRdvContactId = upcomingRdvs[1]?.contact_id || "";
  const thirdRdvContactId = upcomingRdvs[2]?.contact_id || "";

  const { data: firstRdvContact } = useContact(firstRdvContactId);
  const { data: secondRdvContact } = useContact(secondRdvContactId);
  const { data: thirdRdvContact } = useContact(thirdRdvContactId);

  const quickActionCardBase = "flex-1  rounded-3xl p-4 shadow-base gap-7 ";
  const quickActionIconBase = "rounded-xl w-9 h-9 items-center justify-center";
  const quickActionTextBase = "font-medium  leading-4";

  const formatShortDate = (value: string) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  };

  const getEntrepriseNameById = (entrepriseId: string) => {
    return (
      allEntreprisesData?.entreprises.find((e) => e.id === entrepriseId)?.nom ||
      "Entreprise inconnue"
    );
  };

  const getContactDisplayName = (contactId?: string) => {
    if (!contactId) return "Client non defini";

    const contact = [firstRdvContact, secondRdvContact, thirdRdvContact].find(
      (c) => c?.id === contactId,
    );

    if (!contact) return "Client non defini";

    return `${contact.prenom || ""} ${contact.nom}`.trim();
  };

  if (!user) {
    return (
      <View>
        {isLoading ? (
          <ActivityIndicator size="large" />
        ) : (
          <>
            <Text>Non connecté</Text>
            <AppButton
              title="Aller a la connexion"
              onPress={() => router.push("/login")}
            />
          </>
        )}
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScrollView
        className="pt-8"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 180 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              refetchRdvs();
            }}
            className="text-primary"
          />
        }
      >
        <View className="flex flex-col gap-5">
          <View>
            <Text className="text-xl font-semibold">Actions rapides</Text>

            <View className="my-4 gap-3">
              <View className="flex-row items-stretch gap-3">
                <TouchableOpacity
                  onPress={() => router.push("/entreprises/create")}
                  className={`${quickActionCardBase} bg-white`}
                >
                  <View className={`${quickActionIconBase} bg-primary/30`}>
                    <Ionicons
                      name="person-add-outline"
                      size={22}
                      color="#2563eb"
                    />
                  </View>
                  <Text className={quickActionTextBase} numberOfLines={2}>
                    Nouvelle entreprise
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push("/entreprises")}
                  className={`${quickActionCardBase} bg-white`}
                >
                  <View className={`${quickActionIconBase} bg-primary/30`}>
                    <Ionicons
                      name="business-outline"
                      size={22}
                      color="#2563eb"
                    />
                  </View>
                  <Text className={quickActionTextBase} numberOfLines={2}>
                    Mes entreprises
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row items-stretch gap-3">
                <TouchableOpacity
                  onPress={() => router.push("/rdvs")}
                  className={`${quickActionCardBase} bg-purpleLight`}
                >
                  <View className={`${quickActionIconBase} bg-purple/30`}>
                    <Ionicons
                      name="calendar-outline"
                      size={22}
                      color={"#A855F7"}
                    />
                  </View>
                  <Text className={quickActionTextBase} numberOfLines={2}>
                    Rendez-vous
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push("/ca")}
                  className={`${quickActionCardBase} bg-greenLight`}
                >
                  <View className={`${quickActionIconBase} bg-greenMedium`}>
                    <Ionicons
                      name="trending-up-outline"
                      size={22}
                      color="#34C759"
                    />
                  </View>
                  <Text className={quickActionTextBase} numberOfLines={2}>
                    Objectifs CA
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View>
            <View className="flex flex-row justify-between align-middle">
              <View className="flex flex-row items-center gap-2">
                <Ionicons name="time-outline" size={20} color="#007aff" />
                <Text className="text-xl font-semibold">
                  Rendez-vous à venir
                </Text>
              </View>
              <View className="flex flex-row items-center  gap-2">
                <Text
                  className=" text-primary  "
                  onPress={() => router.push("/rdvs")}
                >
                  Voir tous
                </Text>
                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color="#007aff"
                />
              </View>
              {isLoadingRdvs && <ActivityIndicator size="small" />}
            </View>
            {upcomingRdvs.length === 0 ? (
              <View className="rounded-3xl border border-slate-100 bg-white px-6 py-8 mt-8 items-center">
                <Text className="text-lg font-bold text-slate-900">
                  Aucun RDV planifié
                </Text>
                <Text className="mt-1 text-center text-sm text-slate-500">
                  Les prochains rendez-vous apparaîtront ici.
                </Text>
              </View>
            ) : (
              upcomingRdvs.map((rdv) => {
                const statusConfig = getRdvStatusConfig(rdv.statut);

                return (
                  <View
                    className="bg-white rounded-3xl p-6 text mt-5 shadow-base"
                    key={rdv._id}
                  >
                    <View className="flex flex-col gap-4">
                      <View>
                        <View className="flex flex-row justify-between items-center ">
                          <Text className="font-semibold text-lg text-gray">
                            {formatShortDate(rdv.date_prevue)}
                          </Text>
                          <View
                            className={`${statusConfig.badgeBgClass} rounded-3xl px-3 py-2`}
                            style={{
                              backgroundColor: statusConfig.badgeBgColor,
                            }}
                          >
                            <Text
                              className={`${statusConfig.badgeTextClass} font-bold`}
                              style={{ color: statusConfig.badgeTextColor }}
                            >
                              {statusConfig.label}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-lg font-bold">{rdv.titre}</Text>
                      </View>
                      <View className="bg-grayLight h-[0.3px]"></View>
                      <View className="flex flex-row gap-2 items-center ">
                        <Ionicons
                          name="business-outline"
                          size={15}
                          color="#4B5563"
                        />
                        <Text className="text-lg capitalize text-gray">
                          {getEntrepriseNameById(rdv.entreprise_id)}
                        </Text>
                        <Text className="text-lg text-gray">-</Text>
                        <Text className="text-lg capitalize text-gray">
                          {getContactDisplayName(rdv.contact_id)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      <BtnPlus
        formType="entreprise"
        onOpenEntreprise={() => router.push("/entreprises/create")}
      />
    </View>
  );
}
