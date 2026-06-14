import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const userModel = vi.hoisted(() => ({
  comparePassword: vi.fn(),
  createUser: vi.fn(),
  generateJwt: vi.fn(),
  getUserByEmail: vi.fn(),
  getUserById: vi.fn(),
  hashPassword: vi.fn(),
  isAnonymizedUser: vi.fn(),
  verifyJwt: vi.fn(),
}));

const entrepriseModel = vi.hoisted(() => ({
  getEntreprises: vi.fn(),
  getEntrepriseById: vi.fn(),
  createEntreprise: vi.fn(),
  updateEntreprise: vi.fn(),
  deleteEntreprise: vi.fn(),
}));

const contactModel = vi.hoisted(() => ({
  getContactsByEntreprise: vi.fn(),
  getContactById: vi.fn(),
  createContact: vi.fn(),
  updateContact: vi.fn(),
  deleteContact: vi.fn(),
}));

const noteModel = vi.hoisted(() => ({
  createNote: vi.fn(),
  getNotesByEntreprise: vi.fn(),
  getNoteById: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
  searchNotes: vi.fn(),
  getTemplatesByType: vi.fn(),
  getNotesForDashboard: vi.fn(),
}));

const rdvStatics = vi.hoisted(() => ({
  save: vi.fn(),
  aggregate: vi.fn(),
  countDocuments: vi.fn(),
  findOne: vi.fn(),
  findOneAndUpdate: vi.fn(),
  deleteOne: vi.fn(),
}));

const RdvMock = vi.hoisted(() => {
  const ctor = vi.fn().mockImplementation(function MockRdv(data) {
    return {
      ...data,
      save: rdvStatics.save,
    };
  });
  Object.assign(ctor, rdvStatics);
  return ctor;
});

const exportService = vi.hoisted(() => ({
  streamRgpdExport: vi.fn(async (_userId: string, res: any) => {
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="export_complet_test.xlsx"');
    res.end(Buffer.from("xlsx"));
  }),
}));

vi.mock("../../src/db/mysql.js", () => ({ pool: { query: vi.fn() } }));
vi.mock("pino-http", () => ({
  default: () => (_req: any, _res: any, next: any) => next(),
}));
vi.mock("../../src/models/user.js", () => userModel);
vi.mock("../../src/models/entreprise.js", () => entrepriseModel);
vi.mock("../../src/models/contact.js", () => contactModel);
vi.mock("../../src/models/note.js", () => noteModel);
vi.mock("../../src/models/rdv.js", () => ({ Rdv: RdvMock }));
vi.mock("../../src/services/exportService.js", () => exportService);
vi.mock("uuid", () => ({ v4: () => "rdv-uuid" }));

import { createApp } from "../../src/app.js";

describe("E2E user workflow", () => {
  beforeEach(() => {
    Object.values(userModel).forEach((mock) => mock.mockReset());
    Object.values(entrepriseModel).forEach((mock) => mock.mockReset());
    Object.values(contactModel).forEach((mock) => mock.mockReset());
    Object.values(noteModel).forEach((mock) => mock.mockReset());
    Object.values(rdvStatics).forEach((mock) => mock.mockReset());
    RdvMock.mockClear();
    RdvMock.mockImplementation(function MockRdv(data) {
      return { ...data, save: rdvStatics.save };
    });
    exportService.streamRgpdExport.mockClear();

    userModel.getUserByEmail.mockResolvedValue(null);
    userModel.hashPassword.mockResolvedValue("hashed-password");
    userModel.createUser.mockResolvedValue({
      id: "user-1",
      email: "mathis@example.com",
      prenom: "Mathis",
      nom: "Lamotte",
    });
    userModel.generateJwt.mockReturnValue("jwt-token");
    userModel.verifyJwt.mockReturnValue({ sub: "user-1" });
    userModel.getUserById.mockResolvedValue({
      id: "user-1",
      email: "mathis@example.com",
      prenom: "Mathis",
      nom: "Lamotte",
    });
    userModel.isAnonymizedUser.mockReturnValue(false);

    entrepriseModel.createEntreprise.mockResolvedValue({
      id: "e1",
      user_id: "user-1",
      nom: "ACME",
      statut: "prospect",
    });
    entrepriseModel.getEntrepriseById.mockResolvedValue({
      id: "e1",
      user_id: "user-1",
      nom: "ACME",
      statut: "prospect",
    });
    contactModel.createContact.mockResolvedValue({
      id: "c1",
      entreprise_id: "e1",
      nom: "Durand",
    });
    noteModel.createNote.mockResolvedValue({
      _id: "n1",
      entreprise_id: "e1",
      contenu: "Premier contact",
      type: "info",
    });
    rdvStatics.save.mockResolvedValue(undefined);
  });

  it("registers, creates CRM data, schedules an RDV and exports user data", async () => {
    const app = createApp();

    const registerResponse = await request(app).post("/v1/auth/register").send({
      email: "mathis@example.com",
      password: "secret123",
      prenom: "Mathis",
      nom: "Lamotte",
    });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body).toEqual({ token: "jwt-token" });

    const meResponse = await request(app)
      .get("/v1/auth/me")
      .set("Authorization", "Bearer jwt-token");

    expect(meResponse.status).toBe(200);
    expect(meResponse.body).toMatchObject({
      id: "user-1",
      email: "mathis@example.com",
    });

    const entrepriseResponse = await request(app)
      .post("/v1/entreprises")
      .set("Authorization", "Bearer jwt-token")
      .send({ nom: "ACME", statut: "prospect" });

    expect(entrepriseResponse.status).toBe(201);
    expect(entrepriseModel.createEntreprise).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        nom: "ACME",
        statut: "prospect",
      }),
    );

    const contactResponse = await request(app)
      .post("/v1/entreprises/e1/contacts")
      .set("Authorization", "Bearer jwt-token")
      .send({ nom: "Durand", email: "durand@example.com" });

    expect(contactResponse.status).toBe(201);
    expect(contactModel.createContact).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        entreprise_id: "e1",
        nom: "Durand",
        email: "durand@example.com",
      }),
    );

    const noteResponse = await request(app)
      .post("/v1/notes")
      .set("Authorization", "Bearer jwt-token")
      .send({ entreprise_id: "e1", contenu: "Premier contact", type: "info" });

    expect(noteResponse.status).toBe(201);
    expect(noteModel.createNote).toHaveBeenCalledWith("user-1", {
      entreprise_id: "e1",
      contenu: "Premier contact",
      type: "info",
      tags: undefined,
      est_template: undefined,
      nom_template: undefined,
    });

    const rdvResponse = await request(app)
      .post("/v1/rdvs")
      .set("Authorization", "Bearer jwt-token")
      .send({
        entreprise_id: "e1",
        titre: "Demo Arius",
        date_prevue: "2026-06-10T10:00:00.000Z",
        duree_minutes: 45,
      });

    expect(rdvResponse.status).toBe(201);
    expect(RdvMock).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: "rdv-uuid",
        user_id: "user-1",
        entreprise_id: "e1",
        titre: "Demo Arius",
      }),
    );

    const exportResponse = await request(app)
      .get("/v1/export/rgpd")
      .set("Authorization", "Bearer jwt-token");

    expect(exportResponse.status).toBe(200);
    expect(exportResponse.headers["content-disposition"]).toContain(
      "export_complet_test.xlsx",
    );
    expect(exportService.streamRgpdExport).toHaveBeenCalledWith(
      "user-1",
      expect.any(Object),
      undefined,
    );
  });

  it("logs in, lists entreprises and creates one before client-side logout", async () => {
    const app = createApp();

    userModel.getUserByEmail.mockResolvedValueOnce({
      id: "user-1",
      email: "mathis@example.com",
      password: "hashed-password",
    });
    userModel.comparePassword.mockResolvedValueOnce(true);
    entrepriseModel.getEntreprises.mockResolvedValueOnce({
      entreprises: [],
      total: 0,
    });
    entrepriseModel.createEntreprise.mockResolvedValueOnce({
      id: "e2",
      user_id: "user-1",
      nom: "Nouvelle Entreprise",
      statut: "prospect",
    });

    const loginResponse = await request(app).post("/v1/auth/login").send({
      email: "mathis@example.com",
      password: "secret123",
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toEqual({ token: "jwt-token" });

    const listResponse = await request(app)
      .get("/v1/entreprises")
      .set("Authorization", "Bearer jwt-token");

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toEqual({ entreprises: [], total: 0 });

    const createResponse = await request(app)
      .post("/v1/entreprises")
      .set("Authorization", "Bearer jwt-token")
      .send({ nom: "Nouvelle Entreprise", statut: "prospect" });

    expect(createResponse.status).toBe(201);
    expect(entrepriseModel.createEntreprise).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        nom: "Nouvelle Entreprise",
        statut: "prospect",
      }),
    );
  });
});
