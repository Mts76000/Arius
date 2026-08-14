import { Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "../global.css";

import { useAuthStore } from "@/store/authStore";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { initWebConfig } from "@/web-config";

const queryClient = new QueryClient();

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const [isMounted, setIsMounted] = useState(false);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const token = useAuthStore((state) => state.token);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const segments = useSegments();
  const isLandingRoute = segments.length === 0;

  useEffect(() => {
    setIsMounted(true);
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => initWebConfig(), []);

  if (!isMounted) {
    return null;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {isInitialized && token && !isLandingRoute && <Header />}
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>

        <StatusBar />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
