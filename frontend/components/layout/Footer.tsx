import React from "react";
import { Tabs, usePathname, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type {
  BottomTabBarProps,
  BottomTabNavigationOptions,
} from "@react-navigation/bottom-tabs";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import { AriusLogo } from "@/components/ui/AriusLogo";

export type FooterTabName = "accueil" | "entreprises" | "rdvs" | "ca";

interface FooterTabConfig {
  name: FooterTabName;
  options: BottomTabNavigationOptions;
}

const createTabIcon = (
  iconName: keyof typeof Ionicons.glyphMap,
): NonNullable<BottomTabNavigationOptions["tabBarIcon"]> => {
  function TabBarIcon({ color, size }: { color: string; size: number }) {
    return <Ionicons name={iconName} size={size} color={color} />;
  }

  return TabBarIcon;
};

const iconByRoute: Record<FooterTabName, keyof typeof Ionicons.glyphMap> = {
  accueil: "home-outline",
  entreprises: "people-outline",
  rdvs: "calendar-outline",
  ca: "bar-chart-outline",
};

const labelByRoute: Record<FooterTabName, string> = {
  accueil: "Accueil",
  entreprises: "Entreprises",
  rdvs: "Rendez-vous",
  ca: "Chiffre d'affaires",
};

export const footerTabs: FooterTabConfig[] = [
  {
    name: "accueil",
    options: {
      headerShown: false,
      tabBarIcon: createTabIcon("home-outline"),
    },
  },
  {
    name: "entreprises",
    options: {
      headerShown: false,
      tabBarIcon: createTabIcon("people-outline"),
    },
  },
  {
    name: "rdvs",
    options: {
      headerShown: false,
      tabBarIcon: createTabIcon("calendar-outline"),
    },
  },
  {
    name: "ca",
    options: {
      headerShown: false,
      tabBarIcon: createTabIcon("bar-chart-outline"),
    },
  },
];

export function FooterTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 700;

  const renderNativeWindTabBar = ({ state, navigation }: BottomTabBarProps) => {
    const visibleRouteNames: FooterTabName[] = ["accueil", "entreprises", "rdvs", "ca"];

    const visibleRoutes = state.routes.filter((route) =>
      visibleRouteNames.includes(route.name as FooterTabName),
    );

    if (isDesktop) {
      return (
        <View className="absolute bottom-0 left-0 top-0 w-60 border-r border-slate-200 bg-white px-4 py-6">
          <View className="mb-8 px-2">
            <AriusLogo showText />
          </View>

          <View className="gap-1">
            {visibleRoutes.map((route) => {
              const isFocused = state.routes[state.index].key === route.key;
              const routeName = route.name as FooterTabName;

              const onPress = () => {
                if (routeName === "entreprises" && pathname !== "/(tabs)/entreprises") {
                  router.replace("/(tabs)/entreprises");
                  return;
                }

                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              return (
                <Pressable
                  key={route.key}
                  onPress={onPress}
                  className={`h-12 flex-row items-center gap-3 rounded-lg px-3 ${
                    isFocused ? "bg-primaryLight" : "bg-white"
                  }`}
                  accessibilityRole="button"
                >
                  <Ionicons
                    name={iconByRoute[routeName]}
                    size={22}
                    color={isFocused ? "#007aff" : "#64748b"}
                  />
                  <Text
                    className={`font-semibold ${
                      isFocused ? "text-primary" : "text-slate-600"
                    }`}
                  >
                    {labelByRoute[routeName]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      );
    }

    return (
      <View className="absolute left-4 right-4 bottom-10 h-16 flex-row items-center justify-center gap-10 rounded-full border-[0.3px] border-grayLight bg-white shadow-sm">
        {visibleRoutes.map((route) => {
          const isFocused = state.routes[state.index].key === route.key;
          const routeName = route.name as FooterTabName;

          const onPress = () => {
            if (routeName === "entreprises" && pathname !== "/(tabs)/entreprises") {
              router.replace("/(tabs)/entreprises");
              return;
            }

            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              className="h-12 w-12 items-center justify-center"
              accessibilityRole="button"
            >
              <Ionicons
                name={iconByRoute[routeName]}
                size={30}
                color={isFocused ? "#007aff" : "#94a3b8"}
              />
            </Pressable>
          );
        })}
      </View>
    );
  };

  return (
    <Tabs
      tabBar={renderNativeWindTabBar}
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: "#f8fafc",
          marginLeft: isDesktop ? 240 : 0,
        },
      }}
    >
      {footerTabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={tab.options}
          listeners={
            tab.name === "entreprises"
              ? {
                  tabPress: (e) => {
                    const isOnEntreprisesList = pathname === "/(tabs)/entreprises";

                    if (!isOnEntreprisesList) {
                      e.preventDefault();
                      router.replace("/(tabs)/entreprises");
                    }
                  },
                }
              : undefined
          }
        />
      ))}
      <Tabs.Screen name="profil" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="privacy" options={{ href: null, headerShown: false }} />
    </Tabs>
  );
}
