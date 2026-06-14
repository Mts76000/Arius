export const ENTREPRISE_STATUSES = [
  "client",
  "prospect",
  "fournisseur",
  "a_reactiver",
] as const;

export const NOTE_TYPES = ["appel", "reunion", "email", "info", "autre"] as const;

export const RDV_STATUSES = ["planifie", "termine", "annule"] as const;

export type EntrepriseStatus = (typeof ENTREPRISE_STATUSES)[number];
export type NoteType = (typeof NOTE_TYPES)[number];
export type RdvStatus = (typeof RDV_STATUSES)[number];
