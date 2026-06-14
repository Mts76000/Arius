import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";

type EntrepriseAvatarProps = {
  name?: string | null;
  logo?: string | null;
  size?: number;
  rounded?: "full" | "xl";
  className?: string;
};

const baseURL = Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:3000";

const getLogoUri = (logo?: string | null) => {
  const path = typeof logo === "string" ? logo.trim() : "";
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${baseURL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
};

const getInitials = (name?: string | null) => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  return parts
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

export function EntrepriseAvatar({
  name,
  logo,
  size = 56,
  rounded = "full",
  className = "",
}: EntrepriseAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const logoUri = useMemo(() => getLogoUri(logo), [logo]);
  const initials = useMemo(() => getInitials(name), [name]);

  useEffect(() => {
    setImageError(false);
  }, [logoUri]);

  const canShowImage = Boolean(logoUri) && !imageError;
  const borderRadius = rounded === "full" ? size / 2 : 18;

  return (
    <View
      className={`items-center justify-center overflow-hidden border border-primary/20 bg-primary/15 ${className}`}
      style={{ width: size, height: size, borderRadius }}
    >
      {canShowImage ? (
        <Image
          source={{ uri: logoUri }}
          className="h-full w-full"
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      ) : initials ? (
        <Text
          className="font-semibold uppercase text-primary"
          style={{ fontSize: Math.max(12, Math.round(size * 0.34)) }}
          numberOfLines={1}
        >
          {initials}
        </Text>
      ) : (
        <Ionicons
          name="business-outline"
          size={Math.max(16, Math.round(size * 0.4))}
          color="#0ea5e9"
        />
      )}
    </View>
  );
}
