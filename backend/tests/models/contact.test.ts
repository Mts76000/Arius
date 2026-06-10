import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
}));

vi.mock("../../src/db/mysql.js", () => ({
  pool: mocks,
}));

vi.mock("uuid", () => ({
  v4: () => "contact-uuid",
}));

import {
  createContact,
  getContactById,
  getContactsByEntreprise,
  updateContact,
} from "../../src/models/contact.js";

describe("contact model", () => {
  beforeEach(() => {
    mocks.execute.mockReset();
  });

  it("converts MySQL boolean flags when listing contacts", async () => {
    mocks.execute.mockResolvedValueOnce([
      [
        { id: "c1", contact_principal: 1 },
        { id: "c2", contact_principal: 0 },
      ],
    ]);

    const contacts = await getContactsByEntreprise("e1", "user-1");

    expect(contacts.map((contact) => contact.contact_principal)).toEqual([
      true,
      false,
    ]);
  });

  it("clears other primary contacts before creating a new primary contact", async () => {
    mocks.execute
      .mockResolvedValueOnce([{ affectedRows: 2 }])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[{ id: "contact-uuid", contact_principal: 1 }]]);

    const contact = await createContact("user-1", {
      entreprise_id: "e1",
      nom: "Durand",
      contact_principal: true,
    });

    expect(contact.contact_principal).toBe(true);
    expect(mocks.execute).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("UPDATE contacts SET contact_principal = FALSE"),
      ["e1", "user-1"],
    );
    expect(mocks.execute).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("INSERT INTO contacts"),
      [
        "contact-uuid",
        "user-1",
        "e1",
        null,
        "Durand",
        null,
        null,
        null,
        null,
        true,
        null,
      ],
    );
  });

  it("clears other primary contacts before updating a contact as primary", async () => {
    mocks.execute
      .mockResolvedValueOnce([[{ id: "c1", entreprise_id: "e1", contact_principal: 0 }]])
      .mockResolvedValueOnce([{ affectedRows: 2 }])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[{ id: "c1", entreprise_id: "e1", contact_principal: 1 }]]);

    const contact = await updateContact("c1", "user-1", {
      contact_principal: true,
    });

    expect(contact?.contact_principal).toBe(true);
    expect(mocks.execute).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("AND id != ?"),
      ["e1", "user-1", "c1"],
    );
  });

  it("returns null when a contact does not belong to the user", async () => {
    mocks.execute.mockResolvedValueOnce([[]]);

    await expect(getContactById("c1", "user-1")).resolves.toBeNull();
  });
});
