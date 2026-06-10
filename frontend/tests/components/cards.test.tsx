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
    View: make("View"),
    Text: make("Text"),
    TouchableOpacity: make("TouchableOpacity"),
    Pressable: make("Pressable"),
  };
});

vi.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }: { name: string }) => <TextValue value={name} />,
}));

function TextValue({ value }: { value: string }) {
  return React.createElement("Text", null, value);
}

vi.mock("@/components/ui/ActionMenu", () => ({
  ActionMenu: ({ items, children }: any) => {
    if (typeof children === "function") {
      return <>{children({ close: vi.fn() })}</>;
    }
    return (
      <>
        {items?.map((item: any) => (
          <button key={item.key} onClick={item.onPress}>
            {item.label}
          </button>
        ))}
      </>
    );
  },
}));

vi.mock("expo-constants", () => ({
  default: { expoConfig: { extra: { apiUrl: "http://api.test" } } },
}));

import { ContactCard } from "../../components/cards/ContactCard";
import { DevisCard } from "../../components/cards/DevisCard";
import { NoteCard } from "../../components/cards/NoteCard";
import { RdvCard } from "../../components/cards/RdvCard";

function render(element: React.ReactElement) {
  let renderer!: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(element);
  });
  return renderer;
}

function textContent(node: TestRenderer.ReactTestRenderer) {
  return JSON.stringify(node.toJSON());
}

function pressFirstByText(
  node: TestRenderer.ReactTestRenderer,
  text: string,
  prop: "onPress" | "onClick" = "onPress",
) {
  const containsText = (item: TestRenderer.ReactTestInstance): boolean =>
    item.children.some((child: any) => {
      if (typeof child === "string") return child.includes(text);
      if (child && typeof child === "object" && "children" in child) {
        return containsText(child as TestRenderer.ReactTestInstance);
      }
      return false;
    });

  const match = node.root.findAll(
    (item) =>
      typeof item.props?.[prop] === "function" && containsText(item),
  )[0];
  expect(match).toBeTruthy();
  act(() => match.props[prop]());
}

describe("card components", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("renders contact details and triggers actions", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onCall = vi.fn();
    const onEmail = vi.fn();

    const card = render(
      <ContactCard
        contact={{
          id: "c1",
          user_id: "user-1",
          entreprise_id: "e1",
          prenom: "Mathis",
          nom: "Lamotte",
          poste: "Commercial",
          email: "mathis@example.com",
          tel_direct: "0102030405",
          tel_mobile: "0601020304",
          contact_principal: true,
          commentaire: "Decisionnaire",
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        }}
        onEdit={onEdit}
        onDelete={onDelete}
        onCall={onCall}
        onEmail={onEmail}
      />,
    );

    const tree = textContent(card);
    expect(tree).toContain("ML");
    expect(tree).toContain("Mathis Lamotte");
    expect(tree).toContain("Principal");
    expect(tree).toContain("Commercial");
    expect(tree).toContain("Decisionnaire");

    pressFirstByText(card, "0601020304");
    pressFirstByText(card, "mathis@example.com");
    pressFirstByText(card, "Modifier", "onClick");
    pressFirstByText(card, "Supprimer", "onClick");

    expect(onCall).toHaveBeenCalledWith("0601020304");
    expect(onEmail).toHaveBeenCalledWith("mathis@example.com");
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: "c1" }));
    expect(onDelete).toHaveBeenCalledWith("c1");
  });

  it("renders empty contact fallback", () => {
    const card = render(
      <ContactCard
        contact={{
          id: "c1",
          user_id: "user-1",
          entreprise_id: "e1",
          prenom: null,
          nom: "",
          poste: null,
          email: null,
          tel_direct: null,
          tel_mobile: null,
          contact_principal: false,
          commentaire: null,
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCall={vi.fn()}
        onEmail={vi.fn()}
      />,
    );

    const tree = textContent(card);
    expect(tree).toContain("?");
    expect(tree).toContain("Poste non renseigné");
    expect(tree).toContain("Aucun moyen de contact renseigné");
  });

  it("renders note type, template badge and actions", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-10T12:00:00.000Z"));
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const card = render(
      <NoteCard
        note={{
          _id: "n1",
          user_id: "user-1",
          entreprise_id: "e1",
          contenu: "Relancer le client",
          type: "appel",
          est_template: true,
          nom_template: "Relance",
          createdAt: "2026-06-10T11:30:00.000Z",
          updatedAt: "2026-06-10T11:30:00.000Z",
        }}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    const tree = textContent(card);
    expect(tree).toContain("Appel");
    expect(tree).toContain("il y a 30m");
    expect(tree).toContain("Modèle");
    expect(tree).toContain("Relancer le client");

    pressFirstByText(card, "Éditer", "onClick");
    pressFirstByText(card, "Supprimer", "onClick");
    expect(onEdit).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it("renders rdv information and status transitions", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-10T08:00:00.000Z"));
    const onChangeStatus = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const card = render(
      <RdvCard
        rdv={{
          _id: "r1",
          user_id: "user-1",
          entreprise_id: "e1",
          titre: "Demo Arius",
          date_prevue: "2026-06-10T10:30:00.000Z",
          duree_minutes: 45,
          statut: "planifie",
          description: "Presentation",
          createdAt: "2026-06-01",
          updatedAt: "2026-06-01",
        }}
        entrepriseName="ACME"
        contactName="Mathis"
        onChangeStatus={onChangeStatus}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    const tree = textContent(card);
    expect(tree).toContain("Demo Arius");
    expect(tree).toContain("Prévu");
    expect(tree).toContain("ACME");
    expect(tree).toContain("Mathis");
    expect(tree).toContain("Aujourd'hui");
    expect(tree).toContain("45");

    pressFirstByText(card, "Terminé");
    pressFirstByText(card, "Modifier");
    pressFirstByText(card, "Supprimer");

    expect(onChangeStatus).toHaveBeenCalledWith("termine");
    expect(onEdit).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it("renders devis details and triggers menu actions", () => {
    const onView = vi.fn();
    const onDelete = vi.fn();

    const card = render(
      <DevisCard
        devis={{
          _id: "d1",
          user_id: "user-1",
          entreprise_id: "e1",
          nom: "proposition commerciale",
          notes: "Valable 30 jours",
          nom_fichier: "proposition.pdf",
          url_fichier: "/uploads/proposition.pdf",
          type_mime: "application/pdf",
          taille_octets: 1536,
          createdAt: "2026-06-10T08:00:00.000Z",
          updatedAt: "2026-06-10T08:00:00.000Z",
        }}
        onView={onView}
        onDelete={onDelete}
      />,
    );

    const tree = textContent(card);
    expect(tree).toContain("proposition commerciale");
    expect(tree).toContain("proposition.pdf");
    expect(tree).toContain("1.5 KB");
    expect(tree).toContain("Valable 30 jours");

    pressFirstByText(card, "Ouvrir", "onClick");
    pressFirstByText(card, "Supprimer", "onClick");

    expect(onView).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it("disables devis delete action while deleting", () => {
    const onDelete = vi.fn();
    const card = render(
      <DevisCard
        devis={{
          _id: "d1",
          user_id: "user-1",
          entreprise_id: "e1",
          nom: "Devis",
          nom_fichier: "devis.pdf",
          url_fichier: "/uploads/devis.pdf",
          type_mime: "application/pdf",
          taille_octets: 0,
          createdAt: "2026-06-10T08:00:00.000Z",
          updatedAt: "2026-06-10T08:00:00.000Z",
        }}
        onView={vi.fn()}
        onDelete={onDelete}
        isDeleting
      />,
    );

    expect(textContent(card)).toContain("Suppression...");
    expect(textContent(card)).toContain("0 B");
  });
});
