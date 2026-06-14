import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => {
  const React = require("react");
  const make = (type: string) =>
    function MockComponent({ children, ...props }: any) {
      return React.createElement(type, props, children);
    };

  return {
    ActivityIndicator: make("ActivityIndicator"),
    Alert: { alert: vi.fn() },
    Image: make("Image"),
    Platform: { OS: "web" },
    Pressable: make("Pressable"),
    ScrollView: make("ScrollView"),
    Text: make("Text"),
    TextInput: make("TextInput"),
    TouchableOpacity: make("TouchableOpacity"),
    View: make("View"),
    useWindowDimensions: () => ({ width: 390, height: 800 }),
  };
});

const router = {
  back: vi.fn(),
  replace: vi.fn(),
};

vi.mock("expo-router", () => ({
  useRouter: () => router,
}));

vi.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }: { name: string }) => React.createElement("Text", null, name),
}));

vi.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 24, left: 0 }),
}));

vi.mock("expo-constants", () => ({
  default: { expoConfig: { extra: { apiUrl: "http://api.test" } } },
}));

vi.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: vi.fn(),
}));

const authStore = vi.hoisted(() => ({
  clearError: vi.fn(),
  forgotPassword: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock("@/store/authStore", () => ({
  useAuthStore: (selector?: any) => {
    const state = {
      token: "token-1",
      user: null,
      isLoading: false,
      error: null,
      clearError: authStore.clearError,
      forgotPassword: authStore.forgotPassword,
      login: authStore.login,
      register: authStore.register,
    };

    return selector ? selector(state) : state;
  },
}));

const createEntrepriseMutation = vi.hoisted(() => ({
  isPending: false,
  mutateAsync: vi.fn(),
}));

vi.mock("@/hooks/useEntreprises", () => ({
  useCreateEntreprise: () => createEntrepriseMutation,
}));

import LoginScreen from "../../app/(auth)/login";
import CreateEntrepriseScreen from "../../app/(tabs)/entreprises/create";

function render(element: React.ReactElement) {
  let renderer!: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(element);
  });
  return renderer;
}

function hasText(item: TestRenderer.ReactTestInstance, text: string): boolean {
  return item.children.some((child: any) => {
    if (typeof child === "string") return child.includes(text);
    if (child && typeof child === "object" && "children" in child) {
      return hasText(child as TestRenderer.ReactTestInstance, text);
    }
    return false;
  });
}

function changeInputByPlaceholder(
  node: TestRenderer.ReactTestRenderer,
  placeholder: string,
  value: string,
) {
  const input = node.root.findAllByType("TextInput").find(
    (item) => item.props.placeholder === placeholder,
  );

  expect(input).toBeTruthy();
  act(() => input!.props.onChangeText(value));
}

async function pressByText(
  node: TestRenderer.ReactTestRenderer,
  text: string,
) {
  const match = node.root.findAll(
    (item) =>
      typeof item.props?.onPress === "function" && hasText(item, text),
  )[0];

  expect(match).toBeTruthy();
  await act(async () => {
    await match.props.onPress();
  });
}

describe("app user flows", () => {
  beforeEach(() => {
    router.back.mockClear();
    router.replace.mockClear();
    Object.values(authStore).forEach((mock) => mock.mockReset());
    createEntrepriseMutation.mutateAsync.mockReset();
    createEntrepriseMutation.isPending = false;
  });

  it("logs in from the login screen with entered credentials", async () => {
    authStore.login.mockResolvedValueOnce(undefined);
    const screen = render(<LoginScreen />);

    changeInputByPlaceholder(screen, "email@exemple.com", "demo@arius.local");
    changeInputByPlaceholder(screen, "Mot de passe", "Password123");
    await pressByText(screen, "Se connecter");

    expect(authStore.clearError).toHaveBeenCalled();
    expect(authStore.login).toHaveBeenCalledWith(
      "demo@arius.local",
      "Password123",
    );
  });

  it("creates an entreprise then navigates to its detail page", async () => {
    createEntrepriseMutation.mutateAsync.mockResolvedValueOnce({ id: "e1" });
    const screen = render(<CreateEntrepriseScreen />);

    changeInputByPlaceholder(screen, "Nom de l'entreprise", "Arius");
    await pressByText(screen, "Créer l'entreprise");

    expect(createEntrepriseMutation.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        nom: "Arius",
        statut: "prospect",
      }),
    );
    expect(router.replace).toHaveBeenCalledWith("/(tabs)/entreprises/e1");
  });
});
