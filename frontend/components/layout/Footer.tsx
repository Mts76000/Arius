import React from "react";
import { Tabs, usePathname, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type {
  BottomTabBarProps,
  BottomTabNavigationOptions,
} from "@react-navigation/bottom-tabs";
import { Pressable, View } from "react-native";

export type FooterTabName = "index" | "entreprises" | "rdvs" | "ca";

interface FooterTabConfig {
  name: FooterTabName;
  options: BottomTabNavigationOptions;
}

const createTabIcon = (
  iconName: keyof typeof Ionicons.glyphMap,
): NonNullable<BottomTabNavigationOptions["tabBarIcon"]> => {
  return ({ color, size }) => (
    <Ionicons name={iconName} size={size} color={color} />
  );
};

const iconByRoute: Record<FooterTabName, keyof typeof Ionicons.glyphMap> = {
  index: "home-outline",
  entreprises: "people-outline",
  rdvs: "calendar-outline",
  ca: "bar-chart-outline",
};

export const footerTabs: FooterTabConfig[] = [
  {
    name: "index",
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

  const renderNativeWindTabBar = ({ state, navigation }: BottomTabBarProps) => {
    const visibleRouteNames: FooterTabName[] = [
      "index",
      "entreprises",
      "rdvs",
      "ca",
    ];

    const visibleRoutes = state.routes.filter((route) =>
      visibleRouteNames.includes(route.name as FooterTabName),
    );

    return (
      <View className="absolute left-4 right-4 bottom-10 h-16 flex-row items-center justify-center gap-10  rounded-full border-[0.3px] border-grayLight bg-white shadow-sm">
        {visibleRoutes.map((route) => {
          const isFocused = state.routes[state.index].key === route.key;
          const routeName = route.name as FooterTabName;

          const onPress = () => {
            if (
              routeName === "entreprises" &&
              pathname !== "/(tabs)/entreprises"
            ) {
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
      screenOptions={{ headerShown: false }}
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
                    const isOnEntreprisesList =
                      pathname === "/(tabs)/entreprises";

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
    </Tabs>
  );
}
