import { describe, expect, it } from "vitest";
import {
  getNextRdvStatuses,
  getRdvStatusConfig,
  normalizeRdvStatus,
} from "../../utils/rdvStatus";

describe("rdvStatus utilities", () => {
  it("normalizes unknown and legacy statuses", () => {
    expect(normalizeRdvStatus(undefined)).toBe("planifie");
    expect(normalizeRdvStatus("en_cours")).toBe("planifie");
    expect(normalizeRdvStatus("termine")).toBe("termine");
    expect(normalizeRdvStatus("unexpected")).toBe("planifie");
  });

  it("returns display config and next statuses", () => {
    expect(getRdvStatusConfig("annule").label).toBe("Annulé");
    expect(getNextRdvStatuses("planifie")).toEqual(["termine", "annule"]);
  });
});
