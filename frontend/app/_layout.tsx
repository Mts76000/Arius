import { Stack, useSegments } from "expo-router";
import Head from "expo-router/head";
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
    <>
      <Head>
        <title>Arius — Le CRM de poche pour indépendants et PME</title>
        <meta
          name="description"
          content="Arius est un CRM simple, rapide et mobile-first pour gérer vos clients, rendez-vous, notes et chiffre d'affaires. Vos données vous appartiennent."
        />
        <meta property="og:title" content="Arius — Le CRM de poche" />
        <meta
          property="og:description"
          content="Arius rassemble entreprises, rendez-vous, notes et chiffre d'affaires dans une application conçue pour aller vite — sur mobile comme sur desktop."
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Arius" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Arius — Le CRM de poche" />
        <meta
          name="twitter:description"
          content="Arius rassemble entreprises, rendez-vous, notes et chiffre d'affaires dans une application conçue pour aller vite."
        />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://arius.app" />
      </Head>
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
    </>
  );
}
