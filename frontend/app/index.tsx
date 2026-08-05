import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import type { ComponentProps } from "react";
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

type IconName = ComponentProps<typeof Ionicons>["name"];

const features: { icon: IconName; title: string; description: string }[] = [
  {
    icon: "business-outline",
    title: "Entreprises & contacts",
    description:
      "Centralisez vos entreprises, contacts et leur historique dans une seule fiche claire.",
  },
  {
    icon: "calendar-outline",
    title: "Rendez-vous",
    description:
      "Planifiez vos rendez-vous et retrouvez vos notes en un instant avant chaque échange.",
  },
  {
    icon: "trending-up-outline",
    title: "Suivi du chiffre d'affaires",
    description:
      "Visualisez votre CA par client et par période pour piloter votre activité commerciale.",
  },
  {
    icon: "download-outline",
    title: "Export Excel",
    description:
      "Exportez vos données en un clic pour vos rapports ou votre comptabilité.",
  },
];

const steps: { number: string; title: string; description: string }[] = [
  {
    number: "1",
    title: "Ajoutez vos entreprises",
    description: "Importez ou créez vos clients et prospects en quelques secondes.",
  },
  {
    number: "2",
    title: "Suivez vos échanges",
    description: "Notez vos rendez-vous, relances et informations importantes.",
  },
  {
    number: "3",
    title: "Pilotez votre activité",
    description: "Gardez une vue d'ensemble claire de votre chiffre d'affaires.",
  },
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
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="w-full items-center">
        {/* Nav */}
        <View
          className="w-full flex-row items-center justify-between border-b border-slate-100 px-5 py-4"
          style={{ maxWidth: "100%" }}
        >
          <View className="w-full flex-row items-center justify-between" style={{ maxWidth: 1080, marginHorizontal: "auto" }}>
            <AriusLogo size={40} showText />
            <Pressable
              accessibilityRole="button"
              onPress={goToLogin}
              className="rounded-lg border border-slate-300 px-5 py-2.5"
            >
              <Text className="font-semibold text-slate-800">Connexion</Text>
            </Pressable>
          </View>
        </View>

        <View className="w-full px-5" style={{ maxWidth: 1080 }}>
          {/* Hero */}
          <View
            className="items-center gap-4"
            style={{
              paddingBottom: isDesktop ? 64 : 40,
              paddingTop: isDesktop ? 96 : 56,
            }}
          >
            <View className="rounded-full border border-slate-200 px-4 py-1.5">
              <Text className="text-sm font-semibold text-slate-600">
                CRM commercial pour indépendants et PME
              </Text>
            </View>

            <Text
              className="text-center font-bold leading-tight text-slate-950"
              style={{ fontSize: isDesktop ? 56 : 38, maxWidth: 820 }}
            >
              Le CRM simple pour gérer vos clients au quotidien.
            </Text>

            <Text
              className="text-center text-lg leading-8 text-slate-600"
              style={{ maxWidth: 640 }}
            >
              Arius rassemble vos entreprises, vos rendez-vous et votre chiffre
              d&apos;affaires dans une interface simple, pensée pour aller vite au
              quotidien.
            </Text>

            <View
              className="mt-2 items-center gap-3"
              style={{ flexDirection: isDesktop ? "row" : "column", width: isDesktop ? undefined : "100%" }}
            >
              <Pressable
                accessibilityRole="button"
                onPress={goToLogin}
                className="h-14 w-full flex-row items-center justify-center gap-2 rounded-lg bg-primary px-8"
                style={{ width: isDesktop ? undefined : "100%" }}
              >
                <Text className="text-lg font-bold text-white">Commencer</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </Pressable>
            </View>
          </View>

          {/* Features */}
          <View style={{ paddingBottom: isDesktop ? 72 : 48 }}>
            <Text
              className="text-center font-bold text-slate-950"
              style={{ fontSize: isDesktop ? 32 : 26 }}
            >
              Tout ce qu&apos;il faut, rien de superflu
            </Text>
            <Text className="mx-auto mt-3 text-center text-base text-slate-600" style={{ maxWidth: 560 }}>
              Quatre outils essentiels pour ne plus rien perdre de votre relation
              client.
            </Text>

            <View
              className="mt-10 gap-4"
              style={{
                flexDirection: isDesktop ? "row" : "column",
                flexWrap: "wrap",
              }}
            >
              {features.map((feature) => (
                <View
                  key={feature.title}
                  className="gap-3 rounded-xl border border-slate-200 p-6"
                  style={{
                    flexBasis: isDesktop ? "48%" : undefined,
                    flexGrow: 1,
                  }}
                >
                  <View className="h-11 w-11 items-center justify-center rounded-lg bg-primaryLight">
                    <Ionicons name={feature.icon} size={22} color="#007aff" />
                  </View>
                  <Text className="text-lg font-bold text-slate-950">{feature.title}</Text>
                  <Text className="text-base leading-6 text-slate-600">
                    {feature.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* How it works */}
          <View
            className="rounded-2xl border border-slate-200 p-6"
            style={{ paddingBottom: isDesktop ? 48 : 32, paddingTop: isDesktop ? 48 : 32 }}
          >
            <Text
              className="text-center font-bold text-slate-950"
              style={{ fontSize: isDesktop ? 32 : 26 }}
            >
              Comment ça marche
            </Text>

            <View
              className="mt-10 gap-8"
              style={{ flexDirection: isDesktop ? "row" : "column" }}
            >
              {steps.map((step) => (
                <View key={step.number} className="gap-3" style={{ flex: 1 }}>
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-slate-900">
                    <Text className="text-base font-bold text-white">{step.number}</Text>
                  </View>
                  <Text className="text-lg font-bold text-slate-950">{step.title}</Text>
                  <Text className="text-base leading-6 text-slate-600">
                    {step.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Closing CTA */}
          <View
            className="items-center gap-5 rounded-2xl border border-slate-200 bg-slate-50 px-6"
            style={{
              marginTop: isDesktop ? 72 : 48,
              paddingBottom: isDesktop ? 56 : 40,
              paddingTop: isDesktop ? 56 : 40,
            }}
          >
            <Text
              className="text-center font-bold text-slate-950"
              style={{ fontSize: isDesktop ? 32 : 24, maxWidth: 560 }}
            >
              Prêt à simplifier le suivi de vos clients ?
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={goToLogin}
              className="h-14 flex-row items-center justify-center gap-2 rounded-lg bg-primary px-8"
            >
              <Text className="text-lg font-bold text-white">Commencer maintenant</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </Pressable>
          </View>

          {/* Footer */}
          <View
            className="items-center border-t border-slate-100"
            style={{ marginTop: 48, paddingBottom: 32, paddingTop: 24 }}
          >
            <AriusLogo size={32} showText />
            <Text className="mt-3 text-sm text-slate-500">
              © {new Date().getFullYear()} Arius. Tous droits réservés.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
