import React from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface HeroProps {
  onCtaPress: () => void;
}

const indexItems = [
  { icon: "business-outline", label: "Entreprises & contacts" },
  { icon: "calendar-outline", label: "Rendez-vous" },
  { icon: "document-text-outline", label: "Notes & comptes-rendus" },
  { icon: "trending-up-outline", label: "Chiffre d'affaires" },
];

export function Hero({ onCtaPress }: HeroProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  return (
    <View
      className="w-full bg-cream px-5"
      style={{ paddingTop: isDesktop ? 96 : 56, paddingBottom: isDesktop ? 96 : 72 }}
    >
      <View
        className="w-full"
        style={{ maxWidth: 1120, marginHorizontal: "auto" }}
      >
        <View
          style={{
            flexDirection: isDesktop ? "row" : "column",
            alignItems: isDesktop ? "center" : "flex-start",
            gap: isDesktop ? 64 : 40,
          }}
        >
          {/* Left: Copy */}
          <View className="flex-1" style={{ maxWidth: isDesktop ? 560 : "100%" }}>
            <View className="mb-5 self-start rounded-full border border-slate-200 bg-paper px-4 py-1.5">
              <Text className="text-xs font-semibold uppercase tracking-widest text-warmGray">
                Le CRM de poche
              </Text>
            </View>

            <Text
              className="text-ink"
              style={{
                fontSize: isDesktop ? 56 : 40,
                lineHeight: isDesktop ? 62 : 44,
                fontWeight: "800",
                letterSpacing: -1.5,
              }}
            >
              Vos clients, toujours avec vous.
            </Text>

            <Text
              className="mt-5 text-lg leading-8 text-warmGray"
              style={{ maxWidth: 480 }}
            >
              Arius rassemble entreprises, rendez-vous, notes et chiffre
              d&apos;affaires dans une application conçue pour aller vite — sur
              mobile comme sur desktop.
            </Text>

            <View
              className="mt-8 gap-3"
              style={{ flexDirection: isDesktop ? "row" : "column" }}
            >
              <Pressable
                onPress={onCtaPress}
                accessibilityRole="button"
                className="h-14 flex-row items-center justify-center gap-2 rounded-xl bg-primary px-8"
              >
                <Text className="text-lg font-bold text-white">Commencer gratuitement</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </Pressable>

              <Pressable
                onPress={onCtaPress}
                accessibilityRole="button"
                className="h-14 flex-row items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-8"
              >
                <Text className="text-lg font-semibold text-ink">Se connecter</Text>
              </Pressable>
            </View>

            <Text className="mt-4 text-sm text-warmGray">
              Pas de carte bancaire. Vos données vous appartiennent.
            </Text>
          </View>

          {/* Right: Journal index card */}
          <View
            className="rounded-2xl border border-slate-200/50 bg-paper p-6 shadow-soft"
            style={{
              width: isDesktop ? 360 : "100%",
              shadowColor: "#111827",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.04,
              shadowRadius: 24,
              elevation: 4,
            }}
          >
            <View className="mb-4 flex-row items-center gap-2">
              <View className="h-2 w-2 rounded-full bg-slate-400" />
              <Text className="text-xs font-bold uppercase tracking-widest text-warmGray">
                Dans la poche aujourd&apos;hui
              </Text>
            </View>
            <View className="gap-3">
              {indexItems.map((item, index) => (
                <View
                  key={item.label}
                  className={`flex-row items-center gap-3 py-3 ${
                    index !== indexItems.length - 1 ? "border-b border-slate-200/50" : ""
                  }`}
                >
                  <View className="h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Ionicons name={item.icon as any} size={16} color="#007aff" />
                  </View>
                  <Text className="flex-1 text-base font-medium text-ink">
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
