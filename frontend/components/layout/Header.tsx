import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { usePathname, useRouter, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/authStore";

interface UserData {
  id: string;
  email: string;
  prenom: string | null;
  nom: string | null;
}

interface RouteTitleRule {
  title: string;
  match: (path: string) => boolean;
}

const DEFAULT_PAGE_TITLE = "Accueil";

const routeTitleRules: RouteTitleRule[] = [
  {
    title: "Mon Profil",
    match: (path) => path.includes("/profil"),
  },
  {
    title: "Modifier Entreprise",
    match: (path) => path.includes("/entreprises/") && path.endsWith("/edit"),
  },
  {
    title: "Nouvelle Entreprise",
    match: (path) => path.endsWith("/entreprises/create"),
  },
  {
    title: "Détail Entreprise",
    match: (path) => {
      return (
        path.includes("/entreprises/") &&
        !path.endsWith("/entreprises") &&
        !path.endsWith("/edit")
      );
    },
  },
  {
    title: "Entreprises",
    match: (path) => path.includes("/entreprises"),
  },
  {
    title: "Mes Rendez-vous",
    match: (path) => path.includes("/rdvs"),
  },
  {
    title: "Chiffre d'affaires",
    match: (path) => path.includes("/ca"),
  },
  {
    title: DEFAULT_PAGE_TITLE,
    match: (path) =>
      path === "/" || path === "/(tabs)" || path === "/(tabs)/index",
  },
];

const getPageTitle = (path: string) => {
  const matchingRule = routeTitleRules.find((rule) => rule.match(path));

  return matchingRule?.title ?? DEFAULT_PAGE_TITLE;
};

const getInitials = (user?: UserData | null) => {
  const firstName = user?.prenom || "Utilisateur";
  const lastName = user?.nom || "";

  return `${firstName.charAt(0)}${lastName.charAt(0) || ""}`.toUpperCase();
};

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const { width } = useWindowDimensions();
  const user = useAuthStore((state) => state.user as UserData | null);
  const isDesktop = width >= 900;

  const handleAvatarPress = () => {
    router.push("/(tabs)/profil");
  };

  const handleBackPress = () => {
    router.back();
  };

  const pageTitle = getPageTitle(pathname);
  const initials = getInitials(user);
  const shouldShowBack = segments.length > 2;

  const titleContent = (
    <>
      {shouldShowBack && <Ionicons name="chevron-back" size={22} />}
      <Text className="text-2xl font-bold">{pageTitle}</Text>
    </>
  );

  return (
    <View
      className="flex flex-row justify-between border-b border-slate-100 bg-white pl-5 pr-5 pt-16 pb-5 items-center"
      style={{
        marginLeft: isDesktop ? 240 : 0,
        paddingTop: isDesktop ? 28 : 64,
      }}
    >
      {shouldShowBack ? (
        <TouchableOpacity
          onPress={handleBackPress}
          activeOpacity={0.7}
          className="flex flex-row items-center gap-1"
        >
          {titleContent}
        </TouchableOpacity>
      ) : (
        <View className="flex flex-row items-center gap-1">{titleContent}</View>
      )}

      <TouchableOpacity
        onPress={handleAvatarPress}
        activeOpacity={0.7}
        className="h-[50px] w-[50px] items-center justify-center rounded-full bg-primary"
      >
        {!user ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text className="text-xl font-bold text-white">{initials}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
