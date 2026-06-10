import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  alert: vi.fn(),
}));

vi.mock("react-native", () => {
  const React = require("react");
  const make = (type: string) =>
    function MockComponent({ children, ...props }: any) {
      return React.createElement(type, props, children);
    };

  return {
    Alert: { alert: mocks.alert },
    KeyboardAvoidingView: make("KeyboardAvoidingView"),
    Modal: make("Modal"),
    Pressable: make("Pressable"),
    ScrollView: make("ScrollView"),
    Text: make("Text"),
    TextInput: make("TextInput"),
    TouchableOpacity: make("TouchableOpacity"),
    View: make("View"),
    Platform: { OS: "web" },
    useWindowDimensions: () => ({ width: 390, height: 800 }),
  };
});

vi.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }: { name: string }) => React.createElement("Text", null, name),
}));

vi.mock("@react-native-picker/picker", () => {
  const React = require("react");
  const Picker = ({ children, ...props }: any) =>
    React.createElement("Picker", props, children);
  Picker.Item = ({ label, value }: any) =>
    React.createElement("PickerItem", { label, value }, label);
  return { Picker };
});

vi.mock("@react-native-community/datetimepicker", () => ({
  default: (props: any) => React.createElement("DateTimePicker", props),
}));

vi.mock("expo-document-picker", () => ({
  getDocumentAsync: vi.fn(),
}));

import { CAModal } from "../../components/modals/CAModal";
import { ContactModal } from "../../components/modals/ContactModal";
import { DevisModal } from "../../components/modals/DevisModal";
import { NoteModal } from "../../components/modals/NoteModal";
import { ObjectifModal } from "../../components/modals/ObjectifModal";
import { RdvModal } from "../../components/modals/RdvModal";

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

function changeInput(
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

function getInputByPlaceholder(
  node: TestRenderer.ReactTestRenderer,
  placeholder: string,
) {
  const input = node.root.findAllByType("TextInput").find(
    (item) => item.props.placeholder === placeholder,
  );
  expect(input).toBeTruthy();
  return input!;
}

const entreprise = {
  id: "e1",
  user_id: "u1",
  nom: "Arius",
  statut: "prospect" as const,
  rue: null,
  code_postal: null,
  ville: null,
  pays: null,
  description: null,
  logo: null,
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
};

describe("modal components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("alert", mocks.alert);
  });

  it("validates and saves CA modal values", () => {
    const onSave = vi.fn();
    const modal = render(
      <CAModal
        visible
        onClose={vi.fn()}
        onSave={onSave}
        entreprises={[entreprise]}
        entrepriseIdInitial="e1"
        moisInitial={6}
        anneeInitiale={2026}
      />,
    );

    expect(treeText(modal)).toContain("Ajouter du CA");
    pressByText(modal, "Enregistrer");
    expect(mocks.alert).toHaveBeenCalledWith(
      "Veuillez remplir tous les champs correctement",
    );

    changeInput(modal, "0.00", "1250.50");
    pressByText(modal, "Enregistrer");

    expect(onSave).toHaveBeenCalledWith({
      entreprise_id: "e1",
      mois: 6,
      annee: 2026,
      ca_ht: 1250.5,
    });
  });

  it("renders contact modal fields and forwards changes", () => {
    const onChange = vi.fn();
    const onTogglePrincipal = vi.fn();
    const onSave = vi.fn();
    const onClose = vi.fn();

    const modal = render(
      <ContactModal
        visible
        onClose={onClose}
        onSave={onSave}
        isEditing={false}
        contactForm={{
          prenom: "Mathis",
          nom: "Lamotte",
          poste: "",
          email: "",
          tel_mobile: "",
          tel_direct: "",
          contact_principal: false,
          commentaire: "",
        }}
        contactErrors={{ nom: "Nom requis" }}
        onChange={onChange}
        onTogglePrincipal={onTogglePrincipal}
      />,
    );

    expect(treeText(modal)).toContain("Nouveau contact");
    expect(treeText(modal)).toContain("Nom requis");
    changeInput(modal, "Jean", "Marc");
    pressByText(modal, "Contact principal");
    pressByText(modal, "Enregistrer");
    pressByText(modal, "Annuler");

    expect(onChange).toHaveBeenCalledWith("prenom", "Marc");
    expect(onTogglePrincipal).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("validates note modal, applies templates and submits", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onTypeChange = vi.fn();
    const modal = render(
      <NoteModal
        visible
        entrepriseId="e1"
        templates={[
          {
            _id: "t1",
            user_id: "u1",
            entreprise_id: "e1",
            contenu: "Compte rendu template",
            type: "reunion",
            est_template: true,
            nom_template: "CR",
            createdAt: "2026-01-01",
            updatedAt: "2026-01-01",
          },
        ]}
        onSubmit={onSubmit}
        onTypeChange={onTypeChange}
        onClose={vi.fn()}
      />,
    );

    await pressByTextAsync(modal, "Enregistrer");
    expect(treeText(modal)).toContain("Contenu requis");

    pressByText(modal, "Insérer");
    expect(onTypeChange).toHaveBeenCalledWith("reunion");
    pressByText(modal, "Enregistrer comme modèle");
    changeInput(modal, "ex: Compte-rendu réunion standard", "Mon template");
    await pressByTextAsync(modal, "Enregistrer");

    await vi.waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        entreprise_id: "e1",
        contenu: "Compte rendu template",
        type: "reunion",
        est_template: true,
        nom_template: "Mon template",
      }),
    );
  });

  it("validates and submits RDV modal data", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const modal = render(
      <RdvModal
        visible
        entreprises={[entreprise]}
        entrepriseId="e1"
        contacts={[
          {
            id: "c1",
            user_id: "u1",
            entreprise_id: "e1",
            prenom: "Mathis",
            nom: "Lamotte",
            poste: null,
            email: null,
            tel_direct: null,
            tel_mobile: null,
            contact_principal: true,
            commentaire: null,
            created_at: "2026-01-01",
            updated_at: "2026-01-01",
          },
        ]}
        onSubmit={onSubmit}
        onClose={vi.fn()}
      />,
    );

    await pressByTextAsync(modal, "Enregistrer");
    expect(treeText(modal)).toContain("Titre requis");

    changeInput(modal, "Ex: Réunion de présentation", "Demo Arius");
    pressByText(modal, "45 min");
    changeInput(modal, "Notes supplémentaires (optionnel)", "Presentation");
    pressByText(modal, "Terminé");
    await pressByTextAsync(modal, "Enregistrer");

    await vi.waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          titre: "Demo Arius",
          entreprise_id: "e1",
          duree_minutes: 45,
          statut: "termine",
          description: "Presentation",
        }),
      ),
    );
  });

  it("validates DevisModal and accepts a selected PDF", async () => {
    const pdfFile = new File(["pdf"], "devis.pdf", {
      type: "application/pdf",
    });
    Object.defineProperty(pdfFile, "size", { value: 1024 });
    const inputElement = {
      type: "",
      accept: "",
      onchange: null as null | ((event: any) => void),
      click: vi.fn(function click(this: typeof inputElement) {
        this.onchange?.({ target: { files: [pdfFile] } });
      }),
    };
    const documentMock = {
      createElement: vi.fn().mockReturnValue(inputElement),
    };
    vi.stubGlobal("document", documentMock);

    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const modal = render(
      <DevisModal visible onSubmit={onSubmit} onClose={onClose} />,
    );

    await pressByTextAsync(modal, "Enregistrer");
    expect(treeText(modal)).toContain("Nom du devis requis");
    expect(treeText(modal)).toContain("Fichier PDF requis");

    changeInput(modal, "Ex: Devis Q1 2026", "Devis Q1");
    changeInput(modal, "Description ou commentaires...", "Important");
    pressByText(modal, "Sélectionner un PDF");
    expect(treeText(modal)).toContain("devis.pdf");

    await pressByTextAsync(modal, "Enregistrer");
    await vi.waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        nom: "Devis Q1",
        notes: "Important",
        file: pdfFile,
      }),
    );
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("saves ObjectifModal monthly targets and applies January to all months", () => {
    const onSave = vi.fn();
    const modal = render(
      <ObjectifModal
        visible
        onClose={vi.fn()}
        onSave={onSave}
        annee={2026}
        objectifsExistants={[{ mois: 1, objectif_ht: 1000 }]}
      />,
    );

    expect(treeText(modal)).toContain("Objectifs 2026");
    expect(getInputByPlaceholder(modal, "0").props.value).toBe("1000");

    pressByText(modal, "Appliquer janvier à tous les mois");
    pressByText(modal, "Enregistrer");

    expect(onSave).toHaveBeenCalledWith(
      Array.from({ length: 12 }, (_, index) => ({
        mois: index + 1,
        objectif_ht: 1000,
      })),
    );
  });
});
