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
    Text: make("Text"),
    TouchableOpacity: make("TouchableOpacity"),
    View: make("View"),
    Modal: make("Modal"),
    Dimensions: { get: () => ({ width: 360, height: 720 }) },
  };
});

vi.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }: { name: string }) => React.createElement("Text", null, name),
}));

vi.mock("expo-constants", () => ({
  default: { expoConfig: { extra: { apiUrl: "http://api.test" } } },
}));

import { AppButton } from "../../components/ui/AppButton";
import { ActionMenu } from "../../components/ui/ActionMenu";
import { BtnPlus } from "../../components/ui/BtnPlus";
import { EntrepriseAvatar } from "../../components/ui/EntrepriseAvatar";

function render(element: React.ReactElement) {
  let renderer!: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(element);
  });
  return renderer;
}

describe("ui components", () => {
  it("calls AppButton onPress and hides title while loading", () => {
    const onPress = vi.fn();
    const button = render(<AppButton title="Enregistrer" onPress={onPress} />);
    const pressable = button.root.findByType("Pressable");

    act(() => pressable.props.onPress());

    expect(onPress).toHaveBeenCalledOnce();
    expect(JSON.stringify(button.toJSON())).toContain("Enregistrer");

    const loading = render(
      <AppButton title="Enregistrer" onPress={onPress} isLoading />,
    );

    expect(JSON.stringify(loading.toJSON())).not.toContain("Enregistrer");
    expect(loading.root.findByType("Pressable").props.disabled).toBe(true);
  });

  it("renders avatar initials, logo and fallback icon", () => {
    const initials = render(<EntrepriseAvatar name="Arius CRM" />);
    expect(JSON.stringify(initials.toJSON())).toContain("AC");

    const logo = render(<EntrepriseAvatar name="Arius" logo="/uploads/logo.png" />);
    const image = logo.root.findByType("Image");
    expect(image.props.source).toEqual({
      uri: "http://api.test/uploads/logo.png",
    });

    act(() => image.props.onError());
    expect(JSON.stringify(logo.toJSON())).toContain("A");

    const fallback = render(<EntrepriseAvatar />);
    expect(JSON.stringify(fallback.toJSON())).toContain("business-outline");
  });

  it("routes BtnPlus presses according to form type", () => {
    const onOpenRdv = vi.fn();
    const onOpenCA = vi.fn();
    const onOpenEntreprise = vi.fn();
    const onPress = vi.fn();

    for (const [formType, callback] of [
      ["rdv", onOpenRdv],
      ["ca", onOpenCA],
      ["entreprise", onOpenEntreprise],
      ["custom", onPress],
    ] as const) {
      const button = render(
        <BtnPlus
          formType={formType}
          onOpenRdv={onOpenRdv}
          onOpenCA={onOpenCA}
          onOpenEntreprise={onOpenEntreprise}
          onPress={onPress}
          bottom={12}
          right={8}
        />,
      );

      act(() => button.root.findByType("TouchableOpacity").props.onPress());
      expect(callback).toHaveBeenCalledOnce();
    }
  });

  it("opens ActionMenu and calls item callbacks", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const menu = render(
      <ActionMenu
        useModal={false}
        items={[
          { key: "edit", label: "Modifier", onPress: onEdit },
          {
            key: "delete",
            label: "Supprimer",
            disabled: true,
            onPress: onDelete,
          },
        ]}
      />,
    );

    act(() =>
      menu.root.findAllByType("TouchableOpacity")[0].props.onPress({
        stopPropagation: vi.fn(),
        nativeEvent: { pageX: 320, pageY: 50 },
      }),
    );

    expect(JSON.stringify(menu.toJSON())).toContain("Modifier");
    act(() => menu.root.findAllByType("TouchableOpacity")[1].props.onPress());

    expect(onEdit).toHaveBeenCalledOnce();
    expect(onDelete).not.toHaveBeenCalled();
  });
});
