import type { CreateEntrepriseInput } from "@/services/entreprises";
import type { NoteType } from "@/services/notes";
import type { RdvStatus } from "@/services/rdvs";

export type FormContainerMode = "screen" | "sheet";

export type FormKey =
  | "entreprise"
  | "contact"
  | "rdv"
  | "note"
  | "devis"
  | "ca"
  | "objectif";

export interface FormDefinition {
  key: FormKey;
  label: string;
  mode: FormContainerMode;
}

export const FORM_DEFINITIONS: Record<FormKey, FormDefinition> = {
  entreprise: { key: "entreprise", label: "Entreprise", mode: "screen" },
  contact: { key: "contact", label: "Contact", mode: "sheet" },
  rdv: { key: "rdv", label: "RDV", mode: "sheet" },
  note: { key: "note", label: "Note", mode: "sheet" },
  devis: { key: "devis", label: "Devis", mode: "sheet" },
  ca: { key: "ca", label: "CA", mode: "sheet" },
  objectif: { key: "objectif", label: "Objectif", mode: "sheet" },
};

export const getFormModalPresentationStyle = (formKey: FormKey) =>
  FORM_DEFINITIONS[formKey].mode === "sheet" ? "pageSheet" : "fullScreen";

export type EntrepriseStatus = CreateEntrepriseInput["statut"];

export const ENTREPRISE_STATUS_OPTIONS: Array<{
  value: EntrepriseStatus;
  label: string;
}> = [
  { value: "client", label: "Client" },
  { value: "prospect", label: "Prospect" },
  { value: "fournisseur", label: "Fournisseur" },
  { value: "a_reactiver", label: "A reactiver" },
];

export const RDV_STATUS_OPTIONS: Array<{ value: RdvStatus; label: string }> = [
  { value: "planifie", label: "Prevu" },
  { value: "termine", label: "Termine" },
  { value: "annule", label: "Annule" },
];

export const RDV_DURATION_OPTIONS = [15, 30, 45, 60] as const;

export const NOTE_TYPE_OPTIONS: Array<{ value: NoteType; label: string }> = [
  { value: "appel", label: "Appel" },
  { value: "reunion", label: "Reunion" },
  { value: "email", label: "Email" },
  { value: "info", label: "Info" },
  { value: "autre", label: "Autre" },
];

export const MONTH_LABELS = [
  "Janvier",
  "Fevrier",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Aout",
  "Septembre",
  "Octobre",
  "Novembre",
  "Decembre",
] as const;
