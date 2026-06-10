import { describe, expect, it } from "vitest";
import { Devis } from "../../src/models/devis.js";
import { Rdv } from "../../src/models/rdv.js";

describe("mongoose schemas", () => {
  it("defines rdv model metadata and indexes", () => {
    expect(Rdv.modelName).toBe("Rdv");
    expect(Rdv.collection.name).toBe("rdvs");
    expect(Rdv.schema.path("statut").options.enum).toEqual([
      "planifie",
      "termine",
      "annule",
    ]);
    expect(Rdv.schema.indexes()).toEqual(
      expect.arrayContaining([
        [{ user_id: 1, date_prevue: -1 }, expect.any(Object)],
        [{ user_id: 1, statut: 1 }, expect.any(Object)],
      ]),
    );
  });

  it("defines devis model metadata and indexes", () => {
    expect(Devis.modelName).toBe("Devis");
    expect(Devis.collection.name).toBe("devis");
    expect(Devis.schema.path("nom").isRequired).toBe(true);
    expect(Devis.schema.indexes()).toEqual(
      expect.arrayContaining([
        [{ user_id: 1, entreprise_id: 1, createdAt: -1 }, expect.any(Object)],
      ]),
    );
  });
});
