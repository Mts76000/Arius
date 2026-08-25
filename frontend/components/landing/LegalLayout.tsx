import React from "react";
import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import Head from "expo-router/head";
import { Ionicons } from "@expo/vector-icons";
import { AriusLogo } from "@/components/ui/AriusLogo";

interface LegalLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function LegalLayout({ title, description, children }: LegalLayoutProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 760;

  return (
    <View className="h-screen bg-cream">
      <Head>
        <title>{`${title} — Arius`}</title>
        <meta name="description" content={description} />
      </Head>

      <View className="w-full border-b border-slate-100/80 bg-cream px-5 py-4">
        <View
          className="w-full flex-row items-center justify-between"
          style={{ maxWidth: 1120, marginHorizontal: "auto" }}
        >
          <AriusLogo size={40} showText />
          <Pressable
            onPress={() => router.replace("/")}
            accessibilityRole="link"
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 shadow-sm"
          >
            <Text className="font-semibold text-ink">Accueil</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="w-full flex-1"
        contentContainerStyle={{
          paddingHorizontal: isDesktop ? 32 : 20,
          paddingVertical: isDesktop ? 32 : 24,
          maxWidth: 800,
          width: "100%",
          alignSelf: "center",
        }}
      >
        <Pressable
          onPress={() => router.replace("/")}
          accessibilityRole="link"
          className="mb-6 self-start flex-row items-center gap-2"
        >
          <Ionicons name="arrow-back" size={18} color="#007aff" />
          <Text className="text-base font-medium text-primary">Retour à l&apos;accueil</Text>
        </Pressable>

        <Text
          accessibilityRole="header"
          aria-level={1}
          className="mb-6 text-ink"
          style={{
            fontSize: isDesktop ? 36 : 28,
            lineHeight: isDesktop ? 42 : 34,
            fontWeight: "700",
          }}
        >
          {title}
        </Text>

        <View className="gap-6">
          {children}
        </View>
      </ScrollView>

      <View className="w-full border-t border-slate-200 bg-cream px-5 py-6">
        <View
          className="w-full flex-row items-center justify-center"
          style={{ maxWidth: 1120, marginHorizontal: "auto" }}
        >
          <Text className="text-sm text-warmGray">
            © {new Date().getFullYear()} Arius. Tous droits réservés.
          </Text>
        </View>
      </View>
    </View>
  );
}
