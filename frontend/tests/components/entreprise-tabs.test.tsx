import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useDevis: vi.fn(),
  useUploadDevis: vi.fn(),
  useDeleteDevis: vi.fn(),
  useCAEntreprise: vi.fn(),
  useCreateCA: vi.fn(),
  useUpdateCA: vi.fn(),
  useDeleteCA: vi.fn(),
  confirm: vi.fn(),
  open: vi.fn(),
}));

vi.mock("react-native", () => {
  const React = require("react");
  const make = (type: string) =>
    function MockComponent({ children, ...props }: any) {
      return React.createElement(type, props, children);
    };

  return {
    ActivityIndicator: make("ActivityIndicator"),
    Alert: { alert: vi.fn() },
    Modal: make("Modal"),
    Pressable: make("Pressable"),
    ScrollView: make("ScrollView"),
    Text: make("Text"),
    TextInput: make("TextInput"),
    TouchableOpacity: make("TouchableOpacity"),
    View: make("View"),
    Dimensions: { get: () => ({ width: 390, height: 800 }) },
    Platform: { OS: "web" },
  };
});

vi.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }: { name: string }) =>
    React.createElement("Text", null, name),
}));

vi.mock("expo-document-picker", () => ({
  getDocumentAsync: vi.fn(),
}));

vi.mock("@react-native-picker/picker", () => {
  const React = require("react");
  const Picker = ({ children, ...props }: any) =>
    React.createElement("Picker", props, children);
  Picker.Item = ({ label, value }: any) =>
    React.createElement("PickerItem", { label, value }, label);
  return { Picker };
});

vi.mock("expo-constants", () => ({
  default: { expoConfig: { extra: { apiUrl: "http://api.test" } } },
}));

vi.mock("@/hooks/useDevis", () => ({
  useDevis: mocks.useDevis,
  useUploadDevis: mocks.useUploadDevis,
  useDeleteDevis: mocks.useDeleteDevis,
}));

vi.mock("@/hooks/useCA", () => ({
  useCAEntreprise: mocks.useCAEntreprise,
  useCreateCA: mocks.useCreateCA,
  useUpdateCA: mocks.useUpdateCA,
  useDeleteCA: mocks.useDeleteCA,
}));

vi.mock("@/components/ui/ActionMenu", () => ({
  ActionMenu: ({ items }: any) =>
    React.createElement(
      React.Fragment,
      null,
      items?.map((item: any) =>
        React.createElement(
          "button",
          { key: item.key, onClick: item.onPress },
          item.label,
        ),
      ),
    ),
}));

import { ChiffresTab } from "../../components/entreprise/ChiffresTab";
import { DevisTab } from "../../components/entreprise/DevisTab";
import { InfosTab } from "../../components/entreprise/InfosTab";
import { NotesTab } from "../../components/entreprise/NotesTab";
import { RdvsTab } from "../../components/entreprise/RdvsTab";

function render(element: React.ReactElement) {
  let renderer!: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(element);
  });
  return renderer;
}

function text(node: TestRenderer.ReactTestRenderer) {
  return JSON.stringify(node.toJSON());
}

function hasText(item: TestRenderer.ReactTestInstance, value: string): boolean {
  return item.children.some((child: any) => {
    if (typeof child === "string") return child.includes(value);
    if (child && typeof child === "object" && "children" in child) {
      return hasText(child as TestRenderer.ReactTestInstance, value);
    }
    return false;
  });
}

function pressByText(node: TestRenderer.ReactTestRenderer, value: string) {
  const match = node.root.findAll(
    (item) => {
      const handler = item.props?.onPress || item.props?.onClick;
      return Boolean(handler) && hasText(item, value);
    },
  )[0];
  expect(match).toBeTruthy();
  act(() => (match.props.onPress || match.props.onClick)());
}

const entreprise = {
  id: "e1",
  user_id: "u1",
  nom: "Arius",
  statut: "prospect" as const,
  rue: "1 rue du Test",
  code_postal: "75000",
  ville: "Paris",
  pays: "France",
  description: null,
  logo: null,
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
};

const note = {
  _id: "n1",
  user_id: "u1",
  entreprise_id: "e1",
  contenu: "Relance client",
  type: "appel" as const,
  est_template: false,
  nom_template: null,
  createdAt: "2026-06-10T08:00:00.000Z",
  updatedAt: "2026-06-10T08:00:00.000Z",
};

const rdv = {
  _id: "r1",
  user_id: "u1",
  entreprise_id: "e1",
  contact_id: "c1",
  titre: "Demo Arius",
  description: "Presentation",
  date_prevue: "2026-06-10T10:00:00.000Z",
  duree_minutes: 30,
  statut: "planifie" as const,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
};

describe("entreprise tabs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("window", {
      confirm: mocks.confirm,
      open: mocks.open,
    });
    mocks.confirm.mockReturnValue(true);
    mocks.useUploadDevis.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    mocks.useDeleteDevis.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    mocks.useCreateCA.mockReturnValue({ mutateAsync: vi.fn() });
    mocks.useUpdateCA.mockReturnValue({ mutateAsync: vi.fn() });
    mocks.useDeleteCA.mockReturnValue({ mutateAsync: vi.fn() });
  });

  it("renders infos tab with address, contacts and add action", () => {
    const onAddContact = vi.fn();
    const onEditContact = vi.fn();
    const onDeleteContact = vi.fn();
    const tab = render(
      <InfosTab
        entreprise={entreprise}
        contacts={[
          {
            id: "c1",
            user_id: "u1",
            entreprise_id: "e1",
            prenom: "Mathis",
            nom: "Lamotte",
            poste: "Dev",
            email: "m@test.fr",
            tel_direct: null,
            tel_mobile: "0600000000",
            contact_principal: true,
            commentaire: null,
            created_at: "2026-01-01",
            updated_at: "2026-01-01",
          },
        ]}
        contactsLoading={false}
        onAddContact={onAddContact}
        onEditContact={onEditContact}
        onDeleteContact={onDeleteContact}
        onCall={vi.fn()}
        onEmail={vi.fn()}
      />,
    );

    expect(text(tab)).toContain("Adresse");
    expect(text(tab)).toContain("1 rue du Test");
    expect(text(tab)).toContain("Mathis Lamotte");
    pressByText(tab, "+ Ajouter");
    expect(onAddContact).toHaveBeenCalledOnce();
  });

  it("filters notes and forwards note actions", () => {
    const onSearchChange = vi.fn();
    const onTypeFilterChange = vi.fn();
    const onEditNote = vi.fn();
    const onDeleteNote = vi.fn();
    const tab = render(
      <NotesTab
        notes={[note]}
        notesLoading={false}
        noteTypeFilter="all"
        noteSearchQuery=""
        onTypeFilterChange={onTypeFilterChange}
        onSearchChange={onSearchChange}
        onAddNote={vi.fn()}
        onEditNote={onEditNote}
        onDeleteNote={onDeleteNote}
      />,
    );

    expect(text(tab)).toContain("Relance client");
    pressByText(tab, "Emails");
    expect(onTypeFilterChange).toHaveBeenCalledWith("email");

    act(() =>
      tab.root
        .findByType("TextInput")
        .props.onChangeText("relance"),
    );
    expect(onSearchChange).toHaveBeenCalledWith("relance");
    pressByText(tab, "Éditer");
    pressByText(tab, "Supprimer");
    expect(onEditNote).toHaveBeenCalledWith(note);
    expect(onDeleteNote).toHaveBeenCalledWith("n1");
  });

  it("renders rdvs grouped by date and paginates", () => {
    const onPageChange = vi.fn();
    const tab = render(
      <RdvsTab
        rdvs={[rdv]}
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
            contact_principal: false,
            commentaire: null,
            created_at: "2026-01-01",
            updated_at: "2026-01-01",
          },
        ]}
        pagination={{ page: 2, limite: 1, total: 3 }}
        page={2}
        rdvsLoading={false}
        onAddRdv={vi.fn()}
        onEditRdv={vi.fn()}
        onDeleteRdv={vi.fn()}
        onChangeStatus={vi.fn()}
        onPageChange={onPageChange}
      />,
    );

    expect(text(tab)).toContain("Demo Arius");
    expect(text(tab)).toContain("Mathis Lamotte");
    pressByText(tab, "Précédent");
    pressByText(tab, "Suivant");
    expect(onPageChange).toHaveBeenCalledWith(1);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("renders devis tab search, open, delete and empty states", () => {
    const deleteMutation = { mutateAsync: vi.fn(), isPending: false };
    mocks.useDevis.mockReturnValue({
      data: [
        {
          _id: "d1",
          user_id: "u1",
          entreprise_id: "e1",
          nom: "Devis Arius",
          notes: "Important",
          nom_fichier: "devis.pdf",
          url_fichier: "/uploads/devis.pdf",
          type_mime: "application/pdf",
          taille_octets: 1024,
          createdAt: "2026-01-01",
          updatedAt: "2026-01-01",
        },
      ],
      isLoading: false,
      error: null,
    });
    mocks.useDeleteDevis.mockReturnValue(deleteMutation);

    const tab = render(<DevisTab entrepriseId="e1" />);
    expect(text(tab)).toContain("Devis Arius");
    const searchInput = tab.root
      .findAllByType("TextInput")
      .find((input) => input.props.placeholder === "Rechercher un devis...");
    expect(searchInput).toBeTruthy();
    act(() => searchInput!.props.onChangeText("xxx"));
    expect(text(tab)).toContain("Aucun devis trouvé");

    act(() => searchInput!.props.onChangeText("arius"));
    pressByText(tab, "Ouvrir");
    pressByText(tab, "Supprimer");

    expect(mocks.open).toHaveBeenCalledWith(
      "http://api.test/uploads/devis.pdf",
      "_blank",
    );
    expect(deleteMutation.mutateAsync).toHaveBeenCalledWith("d1");
  });

  it("renders chiffres tab totals and opens CA modal", () => {
    mocks.useCAEntreprise.mockReturnValue({
      isLoading: false,
      data: {
        ca_total: 2500,
        moyenne_mensuelle: 1250,
        ca_mensuel: [
          {
            id: "ca1",
            entreprise_id: "e1",
            mois: new Date().getMonth() + 1,
            annee: new Date().getFullYear(),
            ca_ht: 2500,
            created_at: "2026-01-01",
            updated_at: "2026-01-01",
          },
        ],
      },
    });

    const tab = render(<ChiffresTab entreprise={entreprise} />);
    expect(text(tab)).toContain("CA Total");
    expect(text(tab)).toContain("2 500");
    pressByText(tab, "+ Ajouter");
    expect(text(tab)).toContain("Ajouter du CA");
    pressByText(tab, "Vue annuelle");
    expect(text(tab)).toContain("Janvier");
  });
});
