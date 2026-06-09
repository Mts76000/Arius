import { Redirect } from "expo-router";
import React from "react";
import { useAuthStore } from "@/store/authStore";
import { FooterTabs } from "@/components/layout/Footer";

export default function TabsLayout() {
  const token = useAuthStore((state) => state.token);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  if (!isInitialized) {
    return null;
  }

  if (!token) {
    return <Redirect href="/login" />;
  }

  return <FooterTabs />;
}
