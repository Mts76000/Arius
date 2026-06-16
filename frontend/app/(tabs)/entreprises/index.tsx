import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEntreprises } from "@/hooks/useEntreprises";
import type { Entreprise } from "@/services/entreprises";

import { AppButton } from "@/components/ui/AppButton";
import { BtnPlus } from "@/components/ui/BtnPlus";
import { AppSpinner } from "@/components/ui/AppSpinner";
import { EntrepriseAvatar } from "@/components/ui/EntrepriseAvatar";

const STATUS_OPTIONS = [
  { label: "Tous", value: undefined },
  { label: "Clients", value: "client" as const },
  { label: "Prospects", value: "prospect" as const },
  { label: "Fournisseurs", value: "fournisseur" as const },
  { label: "À réactiver", value: "a_reactiver" as const },
];

type EntrepriseStatut = Exclude<Entreprise["statut"], undefined>;

const defaultStatusBadgeClassName = {
  bg: "bg-slate-100",
  text: "text-slate-700",
};

const statusBadgeClassName: Record<
  EntrepriseStatut,
  { bg: string; text: string }
> = {
  client: { bg: "bg-greenMedium", text: "text-green" },
  prospect: { bg: "bg-primary/20", text: "text-primary" },
  fournisseur: { bg: "bg-purple/20", text: "text-purple" },
  a_reactiver: { bg: "bg-orange/20", text: "text-orange" },
};

export default function EntreprisesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 700;
  const [rechercheInput, setRechercheInput] = useState("");
  const [recherche, setRecherche] = useState("");
  const [statutFilter, setStatutFilter] = useState<
    EntrepriseStatut | undefined
  >();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setRecherche(rechercheInput.trim());
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [rechercheInput]);

  const queryParams = useMemo(
    () => ({
      recherche: recherche || undefined,
      statut: statutFilter,
    }),
    [recherche, statutFilter],
  );

  const { data, isLoading, error, refetch } = useEntreprises(queryParams);
  const { data: allEntreprisesData } = useEntreprises();

  const entreprises = data?.entreprises || [];
  const filterCounts = useMemo(() => {
    const allEntreprises = allEntreprisesData?.entreprises || [];

    return allEntreprises.reduce(
      (acc, entreprise) => {
        acc.all += 1;

        if (entreprise.statut) {
          acc[entreprise.statut] += 1;
        }

        return acc;
      },
      {
        all: 0,
        client: 0,
        prospect: 0,
        fournisseur: 0,
        a_reactiver: 0,
      },
    );
  }, [allEntreprisesData?.entreprises]);

  const getCountByFilter = (filter: EntrepriseStatut | undefined) => {
    if (!filter) return filterCounts.all;
    return filterCounts[filter];
  };

  const getContactCount = (entreprise: Entreprise) => {
    type EntrepriseWithOptionalContactCount = Entreprise & {
      contacts_count?: unknown;
      nb_contacts?: unknown;
      contactsCount?: unknown;
      contacts?: unknown;
    };

    const company = entreprise as EntrepriseWithOptionalContactCount;
    const rawCount =
      company.contacts_count ?? company.nb_contacts ?? company.contactsCount;

    if (typeof rawCount === "number" && rawCount >= 0) return rawCount;
    if (typeof rawCount === "bigint" && rawCount >= 0n) {
      return Number(rawCount);
    }
    if (typeof rawCount === "string") {
      const parsed = Number(rawCount);
      if (!Number.isNaN(parsed) && parsed >= 0) return parsed;
    }

    if (Array.isArray(company.contacts)) return company.contacts.length;
    return 0;
  };

  const renderItem = ({ item }: { item: Entreprise }) => {
    const contactCount = getContactCount(item);
    const statusBadge =
      item.statut && statusBadgeClassName[item.statut]
        ? statusBadgeClassName[item.statut]
        : defaultStatusBadgeClassName;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/entreprises/${item.id}` as any)}
        className="mb-3 rounded-xl bg-white p-4 shadow-base"
        activeOpacity={0.85}
      >
        <View className="flex-row gap-4">
          <EntrepriseAvatar name={item.nom} logo={item.logo} size={50} />

          <View className="flex-1 justify-between">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <Text
                  className="text-base font-semibold leading-5 text-slate-900"
                  numberOfLines={2}
                >
                  {item.nom}
                </Text>
                <View className="mt-2 flex-row items-center gap-2">
                  <Ionicons name="person-outline" size={18} color="#6b7280" />
                  <Text className="text-sm text-gray">
                    {contactCount} {contactCount > 1 ? "contacts" : "contact"}
                  </Text>
                </View>
              </View>

              <View className={`rounded-full px-3 py-1.5 ${statusBadge.bg}`}>
                <Text
                  className={`text-xs font-bold uppercase tracking-wide ${statusBadge.text}`}
                >
                  {item.statut === "a_reactiver" ? "A REACTIVER" : item.statut}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="mt-4 h-[0.6px] bg-grayLight" />

        <View className="mt-4 flex-row items-center gap-2">
          <Ionicons name="navigate-outline" size={18} color="#9ca3af" />
          <Text className="text-sm text-gray" numberOfLines={1}>
            {item.code_postal ? `${item.code_postal} ` : ""}
            {item.ville || "Ville non renseignée"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="mb-4 text-center text-base text-red-600">
          Erreur de chargement des entreprises
        </Text>
        <AppButton title="Réessayer" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View
        className="w-full gap-3 px-5 pb-5 pt-5"
        style={{
          alignSelf: "center",
          maxWidth: 1120,
          paddingHorizontal: isDesktop ? 32 : 20,
        }}
      >
        <View className="flex-row items-center gap-2 rounded-2xl bg-white px-4 py-1 shadow-base">
          <Ionicons name="search-outline" size={20} color="#64748b" />
          <TextInput
            placeholder="Rechercher une entreprise..."
            placeholderTextColor={"#64748b"}
            value={rechercheInput}
            onChangeText={setRechercheInput}
            className="flex-1 py-3 text-slate-900"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2 pt-3">
            {STATUS_OPTIONS.map((option) => {
              const isActive = statutFilter === option.value;
              const count = getCountByFilter(option.value);

              return (
                <TouchableOpacity
                  key={option.label}
                  onPress={() => setStatutFilter(option.value)}
                  className={`rounded-full border px-4 py-3 ${
                    isActive
                      ? "border-primary bg-sky-100"
                      : "border-transparent bg-white"
                  }`}
                >
                  <View className="flex-row items-center gap-1.5">
                    <Text
                      className={`  ${isActive ? "text-sky-700" : "text-gray"}`}
                    >
                      {option.label}
                    </Text>
                    <View
                      className={`min-w-6 rounded-full px-2 py-[2px] items-center  ${
                        isActive ? "bg-sky-200" : "bg-slate-100"
                      }`}
                    >
                      <Text
                        className={` ${
                          isActive ? "text-sky-700" : "text-slate-600"
                        }`}
                      >
                        {count}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {isLoading && !data ? (
        <AppSpinner size="large" centered />
      ) : (
        <FlatList
          data={entreprises}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            alignSelf: "center",
            maxWidth: 1120,
            paddingBottom: isDesktop ? 48 : 180,
            paddingHorizontal: isDesktop ? 32 : 20,
            paddingTop: 8,
            width: "100%",
          }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={"#0ea5e9"}
            />
          }
          ListEmptyComponent={
            <View className="items-center px-8 pt-10">
              <Text className="text-base font-semibold text-slate-800">
                Aucune entreprise trouvée
              </Text>
              <Text className="mt-1 text-center text-sm text-gray">
                Essaie une autre recherche ou change les filtres.
              </Text>
            </View>
          }
        />
      )}

      <BtnPlus
        formType="entreprise"
        onOpenEntreprise={() => router.push("/entreprises/create" as any)}
      />
    </View>
  );
}
