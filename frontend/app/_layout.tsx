import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/web-config";

import { useAuthStore } from "@/store/authStore";
import { Colors } from "@/constants/theme";

const queryClient = new QueryClient();

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: Colors.light.tint,
      background: Colors.light.background,
      card: Colors.light.card,
      text: Colors.light.text,
      border: Colors.light.border,
    },
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={navigationTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
        </Stack>

        <StatusBar style="light" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
