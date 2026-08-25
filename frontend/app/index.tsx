import { Redirect, useRouter } from "expo-router";
import Head from "expo-router/head";
import { Platform, ScrollView, View } from "react-native";
import { useAuthStore } from "@/store/authStore";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { JourneySection } from "@/components/landing/JourneySection";
import { ExportSection } from "@/components/landing/ExportSection";
import { FinalCta } from "@/components/landing/FinalCta";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function Root() {
  const router = useRouter();
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const token = useAuthStore((state) => state.token);

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
    <>
      <Head>
        <title>Arius — Le CRM de poche pour indépendants et PME</title>
        <meta
          name="description"
          content="Gérez vos clients, rendez-vous, notes et chiffre d'affaires avec Arius, un CRM simple, rapide et mobile-first. Vos données vous appartiennent."
        />
        <link rel="canonical" href="https://arius.app/" />
      </Head>
      <ScrollView className="flex-1 bg-cream" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="w-full">
        <LandingHeader onCtaPress={goToLogin} />
        <Hero onCtaPress={goToLogin} />
        <ProblemSection />
        <JourneySection />
        <ExportSection />
        <FinalCta onCtaPress={goToLogin} />
        <LandingFooter />
      </View>
    </ScrollView>
    </>
  );
}
