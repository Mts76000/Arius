import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "../global.css";

import { useAuthStore } from "@/store/authStore";
import { Header } from "@/components/layout/Header";
import { initWebConfig } from "@/web-config";

const queryClient = new QueryClient();

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const token = useAuthStore((state) => state.token);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => initWebConfig(), []);

  return (
    <QueryClientProvider client={queryClient}>
      {isInitialized && token && <Header />}
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>

      <StatusBar />
    </QueryClientProvider>
  );
}
