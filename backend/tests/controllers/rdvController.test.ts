import { beforeEach, describe, expect, it, vi } from "vitest";

const rdvStatics = vi.hoisted(() => ({
  aggregate: vi.fn(),
  countDocuments: vi.fn(),
  findOne: vi.fn(),
  findOneAndUpdate: vi.fn(),
  deleteOne: vi.fn(),
  save: vi.fn(),
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

vi.mock("../../src/models/rdv.js", () => ({
  Rdv: RdvMock,
}));

vi.mock("uuid", () => ({
  v4: () => "rdv-uuid",
}));

import {
  create,
  get,
  listByEntreprise,
  listMyRdvs,
  remove,
  update,
} from "../../src/controllers/rdvController.js";

function mockResponse() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe("rdv controller", () => {
  beforeEach(() => {
    RdvMock.mockClear();
    RdvMock.mockImplementation(function MockRdv(data) {
      return {
        ...data,
        save: rdvStatics.save,
      };
    });
    Object.values(rdvStatics).forEach((mock) => mock.mockReset());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("lists current user RDVs with filters and pagination", async () => {
    rdvStatics.aggregate.mockResolvedValueOnce([{ _id: "r1" }]);
    rdvStatics.countDocuments.mockResolvedValueOnce(1);
    const res = mockResponse();

    await listMyRdvs(
      {
        userId: "user-1",
        query: {
          statut: "planifie",
          de: "2026-06-01",
          a: "2026-06-30",
          page: "2",
          limite: "10",
        },
      } as any,
      res as any,
    );

    expect(rdvStatics.aggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        {
          $match: expect.objectContaining({
            user_id: "user-1",
            statut: "planifie",
            date_prevue: expect.objectContaining({
              $gte: expect.any(Date),
              $lte: expect.any(Date),
            }),
          }),
        },
        { $skip: 10 },
        { $limit: 10 },
      ]),
    );
    expect(res.json).toHaveBeenCalledWith({
      rdvs: [{ _id: "r1" }],
      pagination: { page: 2, limite: 10, total: 1 },
    });
  });

  it("accepts already parsed numeric pagination from query validation", async () => {
    rdvStatics.aggregate.mockResolvedValueOnce([{ _id: "r1" }]);
    rdvStatics.countDocuments.mockResolvedValueOnce(1);
    const res = mockResponse();

    await listMyRdvs(
      {
        userId: "user-1",
        validatedQuery: {
          de: "2026-06-14T13:38:34.385Z",
          page: 1,
          limite: 3,
        },
      } as any,
      res as any,
    );

    expect(rdvStatics.aggregate).toHaveBeenCalledWith(
      expect.arrayContaining([{ $skip: 0 }, { $limit: 3 }]),
    );
    expect(res.status).not.toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      rdvs: [{ _id: "r1" }],
      pagination: { page: 1, limite: 3, total: 1 },
    });
  });

  it("lists RDVs for an entreprise scoped to the current user", async () => {
    rdvStatics.aggregate.mockResolvedValueOnce([]);
    rdvStatics.countDocuments.mockResolvedValueOnce(0);
    const res = mockResponse();

    await listByEntreprise(
      { userId: "user-1", params: { id: "e1" }, query: {} } as any,
      res as any,
    );

    expect(rdvStatics.countDocuments).toHaveBeenCalledWith({
      entreprise_id: "e1",
      user_id: "user-1",
    });
    expect(res.json).toHaveBeenCalledWith({
      rdvs: [],
      pagination: { page: 1, limite: 20, total: 0 },
    });
  });

  it("gets one RDV and returns 404 when missing", async () => {
    rdvStatics.findOne.mockResolvedValueOnce({ _id: "r1" });
    const ok = mockResponse();

    await get({ userId: "user-1", params: { id: "r1" } } as any, ok as any);

    expect(rdvStatics.findOne).toHaveBeenCalledWith({
      _id: "r1",
      user_id: "user-1",
    });
    expect(ok.json).toHaveBeenCalledWith({ _id: "r1" });

    rdvStatics.findOne.mockResolvedValueOnce(null);
    const ko = mockResponse();
    await get({ userId: "user-1", params: { id: "r404" } } as any, ko as any);
    expect(ko.status).toHaveBeenCalledWith(404);
  });

  it("validates and creates an RDV with default status", async () => {
    rdvStatics.save.mockResolvedValueOnce(undefined);
    const res = mockResponse();

    await create(
      {
        userId: "user-1",
        body: {
          titre: "Demo",
          date_prevue: "2026-06-10T10:00:00.000Z",
          duree_minutes: 30,
          entreprise_id: "e1",
        },
      } as any,
      res as any,
    );

    expect(RdvMock).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: "rdv-uuid",
        user_id: "user-1",
        entreprise_id: "e1",
        titre: "Demo",
        statut: "planifie",
        date_prevue: expect.any(Date),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("rejects invalid RDV creation payload", async () => {
    const res = mockResponse();

    await create({ userId: "user-1", body: { titre: "x" } } as any, res as any);

    expect(RdvMock).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("updates an RDV with date conversion and handles not found", async () => {
    rdvStatics.findOneAndUpdate.mockResolvedValueOnce({ _id: "r1" });
    const res = mockResponse();

    await update(
      {
        userId: "user-1",
        params: { id: "r1" },
        body: { date_prevue: "2026-06-10T10:00:00.000Z" },
      } as any,
      res as any,
    );

    expect(rdvStatics.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "r1", user_id: "user-1" },
      { date_prevue: expect.any(Date) },
      { new: true },
    );
    expect(res.json).toHaveBeenCalledWith({ _id: "r1" });

    rdvStatics.findOneAndUpdate.mockResolvedValueOnce(null);
    const missing = mockResponse();
    await update(
      { userId: "user-1", params: { id: "missing" }, body: { titre: "Valid" } } as any,
      missing as any,
    );
    expect(missing.status).toHaveBeenCalledWith(404);
  });

  it("deletes an RDV scoped to user", async () => {
    rdvStatics.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });
    const res = mockResponse();

    await remove({ userId: "user-1", params: { id: "r1" } } as any, res as any);

    expect(rdvStatics.deleteOne).toHaveBeenCalledWith({
      _id: "r1",
      user_id: "user-1",
    });
    expect(res.json).toHaveBeenCalledWith({ message: "RDV supprimé" });
  });
});
