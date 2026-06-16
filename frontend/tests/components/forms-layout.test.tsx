import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => {
  const React = require("react");
  const make = (type: string) =>
    function MockComponent({ children, ...props }: any) {
      return React.createElement(type, props, children);
    };

  return {
    ActivityIndicator: make("ActivityIndicator"),
    Image: make("Image"),
    Pressable: make("Pressable"),
    ScrollView: make("ScrollView"),
    Text: make("Text"),
    TextInput: make("TextInput"),
    TouchableOpacity: make("TouchableOpacity"),
    View: make("View"),
    Dimensions: { get: () => ({ width: 390, height: 800 }) },
    useWindowDimensions: () => ({ width: 390, height: 800 }),
    Modal: make("Modal"),
    Platform: { OS: "web" },
    Alert: { alert: vi.fn() },
  };
});

const router = {
  back: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
};

let mockPathname = "/(tabs)/entreprises/create";
let mockSegments: string[] = ["(tabs)", "entreprises", "create"];

vi.mock("expo-router", () => {
  const React = require("react");
  const Screen = ({ name }: any) => React.createElement("Screen", { name });
  const Tabs = ({ children, tabBar, screenOptions }: any) =>
    React.createElement("Tabs", { tabBar, screenOptions }, children);
  Tabs.Screen = Screen;

  return {
    Tabs,
    usePathname: () => mockPathname,
    useRouter: () => router,
    useSegments: () => mockSegments,
  };
});

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

vi.mock("@/store/authStore", () => ({
  useAuthStore: (selector: any) =>
    selector({
      token: "token-1",
      user: { id: "u1", email: "m@test.fr", prenom: "Mathis", nom: "Lamotte" },
    }),
}));

import { EntrepriseHeader } from "../../components/entreprise/EntrepriseHeader";
import { TabNavigation } from "../../components/entreprise/TabNavigation";
import { ChoiceChip, CheckboxRow, FormHeader, PickerFrame } from "../../components/forms/Form";
import { EntrepriseForm } from "../../components/forms/EntrepriseForm";
import { FormInput } from "../../components/forms/FormInput";
import { FooterTabs } from "../../components/layout/Footer";
import { Header } from "../../components/layout/Header";

function render(element: React.ReactElement) {
  let renderer!: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(element);
  });
  return renderer;
}

function treeText(node: TestRenderer.ReactTestRenderer) {
  return JSON.stringify(node.toJSON());
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

function pressByText(node: TestRenderer.ReactTestRenderer, text: string) {
  const match = node.root.findAll(
    (item) =>
      typeof item.props?.onPress === "function" && hasText(item, text),
  )[0];

  expect(match).toBeTruthy();
  act(() => match.props.onPress());
}

async function pressByTextAsync(
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

describe("forms, entreprise and layout components", () => {
  it("toggles password visibility and shows FormInput errors", () => {
    const onChange = vi.fn();
    const input = render(
      <FormInput
        label="Mot de passe"
        value="secret"
        onChangeText={onChange}
        secureTextEntry
        enableVisibilityToggle
        error="Trop court"
      />,
    );

    expect(treeText(input)).toContain("Mot de passe");
    expect(treeText(input)).toContain("Trop court");
    expect(input.root.findByType("TextInput").props.secureTextEntry).toBe(true);

    act(() => input.root.findByType("TouchableOpacity").props.onPress());
    expect(input.root.findByType("TextInput").props.secureTextEntry).toBe(false);
  });

  it("renders form helpers and forwards press callbacks", () => {
    const onCancel = vi.fn();
    const onSave = vi.fn();
    const onChip = vi.fn();
    const onCheck = vi.fn();

    const form = render(
      <>
        <FormHeader title="Edition" onCancel={onCancel} onSave={onSave} />
        <ChoiceChip label="Client" selected onPress={onChip} />
        <CheckboxRow label="Principal" checked onPress={onCheck} />
        <PickerFrame error disabled>
          <TextValue value="Picker" />
        </PickerFrame>
      </>,
    );

    expect(treeText(form)).toContain("Edition");
    expect(treeText(form)).toContain("Client");
    expect(treeText(form)).toContain("Principal");
    pressByText(form, "Annuler");
    pressByText(form, "Enregistrer");
    pressByText(form, "Client");
    pressByText(form, "Principal");

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledOnce();
    expect(onChip).toHaveBeenCalledOnce();
    expect(onCheck).toHaveBeenCalledOnce();
  });

  it("renders entreprise header and tab navigation actions", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onTabChange = vi.fn();

    const header = render(
      <EntrepriseHeader
        entreprise={{
          id: "e1",
          user_id: "u1",
          nom: "Arius",
          statut: "a_reactiver",
          rue: null,
          code_postal: null,
          ville: null,
          pays: null,
          description: "CRM commercial",
          logo: null,
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        }}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    expect(treeText(header)).toContain("Arius");
    expect(treeText(header)).toContain("À réactiver");
    expect(treeText(header)).toContain("CRM commercial");

    const tabs = render(
      <TabNavigation activeTab="infos" onTabChange={onTabChange} />,
    );
    pressByText(tabs, "Notes");
    expect(onTabChange).toHaveBeenCalledWith("notes");
  });

  it("validates and submits EntrepriseForm data", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onCancel = vi.fn();
    const form = render(<EntrepriseForm onSubmit={onSubmit} onCancel={onCancel} />);

    await pressByTextAsync(form, "Enregistrer");
    expect(treeText(form)).toContain("Nom requis");

    const nameInput = form.root.findAllByType("TextInput")[0];
    act(() => nameInput.props.onChangeText("Arius"));
    pressByText(form, "Fournisseur");
    await pressByTextAsync(form, "Enregistrer");

    await vi.waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ nom: "Arius", statut: "fournisseur" }),
        undefined,
      ),
    );

    pressByText(form, "Annuler");
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("renders Header and FooterTabs navigation hooks", () => {
    mockPathname = "/(tabs)/entreprises/create";
    mockSegments = ["(tabs)", "entreprises", "create"];

    const header = render(<Header />);
    expect(
      header.root.findAllByType("Text").some((item) =>
        item.children.includes("Nouvelle Entreprise"),
      ),
    ).toBe(true);
    act(() => header.root.findAllByType("TouchableOpacity")[0].props.onPress());
    act(() => header.root.findAllByType("TouchableOpacity")[1].props.onPress());

    expect(router.back).toHaveBeenCalledOnce();
    expect(router.push).toHaveBeenCalledWith("/(tabs)/profil");

    const footer = render(<FooterTabs />);
    expect(footer.root.findByType("Tabs").props.screenOptions).toMatchObject({
      headerShown: false,
      sceneStyle: {
        backgroundColor: "#f8fafc",
        marginLeft: 0,
      },
    });
    expect(footer.root.findAllByType("Screen").map((screen) => screen.props.name)).toContain("profil");
  });
});

function TextValue({ value }: { value: string }) {
  return React.createElement("Text", null, value);
}
