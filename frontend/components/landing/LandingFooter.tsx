import React from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { AriusLogo } from "@/components/ui/AriusLogo";

const legalLinks = [
  { label: "Politique de confidentialité", href: "/privacy" },
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "CGU", href: "/cgu" },
];

export function LandingFooter() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 760;

  return (
    <View className="w-full border-t border-slate-200 bg-cream px-5 py-10">
      <View
        className="w-full"
        style={{ maxWidth: 1120, marginHorizontal: "auto" }}
      >
        <View
          className="items-center"
          style={{
            flexDirection: isDesktop ? "row" : "column",
            justifyContent: "space-between",
            gap: isDesktop ? 24 : 16,
          }}
        >
          <AriusLogo size={32} showText />

          <View
            className="items-center"
            style={{
              flexDirection: isDesktop ? "row" : "column",
              gap: isDesktop ? 24 : 12,
            }}
          >
            {legalLinks.map((link) => (
              <Pressable
                key={link.href}
                onPress={() => router.push(link.href as any)}
                accessibilityRole="link"
              >
                <Text className="text-sm text-warmGray hover:text-primary">
                  {link.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text className="text-sm text-warmGray">
            © {new Date().getFullYear()} Arius
          </Text>
        </View>
      </View>
    </View>
  );
}
