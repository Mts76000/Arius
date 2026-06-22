import React from "react";
import { ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppButton } from "@/components/ui/AppButton";

export default function NotFoundScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 700;

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="pt-8"
        contentContainerStyle={{
          alignSelf: "center",
          maxWidth: 920,
          paddingBottom: isDesktop ? 56 : 180,
          paddingHorizontal: isDesktop ? 32 : 20,
          width: "100%",
        }}
      >
        <View className="gap-5">
          <View className="rounded-3xl bg-white p-6 shadow-base">
            <View className="flex-row items-start gap-4">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primaryLight">
                <Ionicons name="map-outline" size={26} color="#007aff" />
              </View>

              <View className="min-w-0 flex-1 gap-1">
                <Text className="text-sm font-semibold uppercase text-primary">
                  Erreur 404
                </Text>
                <Text className="text-2xl font-bold text-slate-950">
                  Page introuvable
                </Text>
                <Text className="text-base leading-6 text-slate-500">
                  {"Cette page n'existe pas ou n'est plus disponible."}
                </Text>
              </View>
            </View>
          </View>

          <View className="rounded-3xl bg-white p-5 shadow-base">
            <View className="gap-4">
              <View className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <Text className="text-base font-semibold text-slate-900">
                  Que faire maintenant ?
                </Text>
                <Text className="mt-1 text-sm leading-5 text-slate-500">
                  {"Reviens à l'accueil ou retourne à la page précédente pour "}
                  continuer ta navigation dans Arius.
                </Text>
              </View>

              <View className={isDesktop ? "flex-row gap-3" : "gap-3"}>
                <View className="flex-1">
                  <AppButton
                    title="Retour à l'accueil"
                    onPress={() => router.replace("/accueil" as any)}
                  />
                </View>
                <View className="flex-1">
                  <AppButton
                    title="Page précédente"
                    onPress={() => router.back()}
                    variant="secondary"
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
