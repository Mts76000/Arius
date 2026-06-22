import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { AriusLogo } from "@/components/ui/AriusLogo";
import { useAuthStore } from "@/store/authStore";

const benefits = [
  "Clients et contacts au même endroit",
  "Rendez-vous et notes faciles à retrouver",
  "Export Excel quand vous en avez besoin",
];

export default function Root() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const token = useAuthStore((state) => state.token);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isDesktop = width >= 860;

  if (!isInitialized) {
    return null;
  }

  if (token) {
    return <Redirect href="/accueil" />;
  }

  if (Platform.OS !== "web") {
    return <Redirect href="/login" />;
  }

  const goToLogin = () => router.push("/login");

  return (
    <ScrollView className="flex-1 bg-fond" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="min-h-screen w-full items-center px-5 py-6">
        <View className="w-full" style={{ maxWidth: 1080 }}>
          <View className="flex-row items-center justify-between">
            <AriusLogo size={44} showText />
            <Pressable
              accessibilityRole="button"
              onPress={goToLogin}
              className="rounded-full bg-white px-5 py-3 shadow-sm"
            >
              <Text className="font-semibold text-slate-800">Connexion</Text>
            </Pressable>
          </View>

          <View
            className="gap-8"
            style={{
              alignItems: isDesktop ? "center" : "stretch",
              flexDirection: isDesktop ? "row" : "column",
              paddingBottom: isDesktop ? 72 : 44,
              paddingTop: isDesktop ? 92 : 56,
            }}
          >
            <View className="gap-7" style={{ flex: 1 }}>
              <View className="self-start rounded-full bg-primaryLight px-4 py-2">
                <Text className="text-sm font-bold text-primary">CRM mobile-first</Text>
              </View>

              <View className="gap-4">
                <Text
                  className="font-bold leading-tight text-slate-950"
                  style={{ fontSize: isDesktop ? 64 : 46 }}
                >
                  Suivez vos clients sans vous perdre dans Excel.
                </Text>
                <Text className="max-w-xl text-lg leading-8 text-slate-600">
                  Arius garde vos entreprises, contacts, rendez-vous et notes dans une
                  interface simple, rapide et pensée pour le téléphone.
                </Text>
              </View>

              <View className="gap-3">
                <Pressable
                  accessibilityRole="button"
                  onPress={goToLogin}
                  className="h-14 flex-row items-center justify-center gap-2 rounded-full bg-primary px-6"
                >
                  <Text className="text-lg font-bold text-white">Commencer</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </Pressable>
                <Text className="text-center text-sm font-medium text-slate-500">
                  Une interface claire pour retrouver l'essentiel avant chaque échange
                  client.
                </Text>
              </View>
            </View>

            <View
              className="self-center rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm"
              style={{
                flex: isDesktop ? 0.9 : undefined,
                width: "100%",
                maxWidth: isDesktop ? undefined : 390,
              }}
            >
              <View className="gap-3 rounded-[20px] bg-slate-50 p-3">
                <View className="flex-row items-center justify-between rounded-2xl bg-primary p-4">
                  <View>
                    <Text className="text-sm font-semibold text-white/80">
                      Aujourd'hui
                    </Text>
                    <Text className="text-xl font-bold text-white">3 rendez-vous</Text>
                  </View>
                  <View className="h-11 w-11 items-center justify-center rounded-full bg-white/20">
                    <Ionicons name="calendar-outline" size={22} color="#fff" />
                  </View>
                </View>

                {[
                  ["Meca Industrie", "Client", "2 contacts"],
                  ["Nord Equipement", "Prospect", "Relance devis"],
                  ["Alojob", "À réactiver", "Note ajoutée"],
                ].map(([name, status, meta]) => (
                  <View
                    key={name}
                    className="rounded-2xl border border-slate-100 bg-white p-3"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 pr-3">
                        <Text className="text-xs font-bold text-primary">{status}</Text>
                        <Text className="mt-1 text-base font-bold text-slate-950">
                          {name}
                        </Text>
                        <Text className="text-sm text-slate-500">{meta}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View className="pb-10">
            <View
              className="gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
              style={{ flexDirection: isDesktop ? "row" : "column" }}
            >
              {benefits.map((benefit, index) => (
                <View
                  key={benefit}
                  className="flex-row items-center gap-3"
                  style={{
                    borderLeftColor: isDesktop && index > 0 ? "#e2e8f0" : "transparent",
                    borderLeftWidth: isDesktop && index > 0 ? 1 : 0,
                    flex: 1,
                    paddingLeft: isDesktop && index > 0 ? 18 : 0,
                  }}
                >
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-primaryLight">
                    <Ionicons name="checkmark" size={17} color="#007aff" />
                  </View>
                  <Text className="flex-1 text-base font-semibold text-slate-800">
                    {benefit}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
