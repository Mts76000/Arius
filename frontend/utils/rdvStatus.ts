import { RdvStatus } from "@/services/rdvs";

export interface RdvStatusConfig {
  label: string;
  badgeBgClass: string;
  badgeTextClass: string;
  icon: string;
  iconColor: string;
}

const RDV_STATUS_ORDER: RdvStatus[] = ["planifie", "termine", "annule"];

export const RDV_STATUS_CONFIG: Record<RdvStatus, RdvStatusConfig> = {
  planifie: {
    label: "Prévu",
    badgeBgClass: "bg-primary/15",
    badgeTextClass: "text-primary",
    icon: "calendar-outline",
    iconColor: "#007aff",
  },
  termine: {
    label: "Terminé",
    badgeBgClass: "bg-greenMedium",
    badgeTextClass: "text-green",
    icon: "checkmark-circle-outline",
    iconColor: "#34C759",
  },
  annule: {
    label: "Annulé",
    badgeBgClass: "bg-redLight",
    badgeTextClass: "text-red-300",
    icon: "close-circle-outline",
    iconColor: "#EF4444",
  },
};

export const LEGACY_TO_RDV_STATUS: Record<string, RdvStatus> = {
  en_cours: "planifie",
  reporte: "planifie",
};

export function normalizeRdvStatus(
  value: string | undefined | null,
): RdvStatus {
  if (!value) return "planifie";
  if (value in RDV_STATUS_CONFIG) {
    return value as RdvStatus;
  }
  return LEGACY_TO_RDV_STATUS[value] || "planifie";
}

export function getRdvStatusConfig(
  value: string | undefined | null,
): RdvStatusConfig {
  const status = normalizeRdvStatus(value);
  return RDV_STATUS_CONFIG[status];
}

export function getNextRdvStatuses(
  current: string | undefined | null,
): RdvStatus[] {
  const normalized = normalizeRdvStatus(current);
  return RDV_STATUS_ORDER.filter((status) => status !== normalized);
}
