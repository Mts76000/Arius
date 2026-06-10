import { beforeEach, describe, expect, it, vi } from "vitest";

const queryMocks = vi.hoisted(() => ({
  useQuery: vi.fn((options) => options),
  useMutation: vi.fn((options) => options),
  invalidateQueries: vi.fn(),
  useQueryClient: vi.fn(() => ({ invalidateQueries: queryMocks.invalidateQueries })),
}));

const authStoreMock = vi.hoisted(() => ({
  useAuthStore: vi.fn((selector) => selector({ token: "token" })),
}));

const services = vi.hoisted(() => ({
  caService: {
    getCA: vi.fn(),
    getCAStats: vi.fn(),
    getCAEntreprise: vi.fn(),
    createCA: vi.fn(),
    updateCA: vi.fn(),
    deleteCA: vi.fn(),
  },
  contactsService: {
    getByEntreprise: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  devisService: {
    getByEntreprise: vi.fn(),
    upload: vi.fn(),
    delete: vi.fn(),
  },
  entreprisesService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  notesService: {
    getNotesByEntreprise: vi.fn(),
    getNoteById: vi.fn(),
    createNote: vi.fn(),
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
    searchNotes: vi.fn(),
    getTemplatesByType: vi.fn(),
    getDashboardClientsSuivi: vi.fn(),
  },
  objectifsService: {
    getObjectifs: vi.fn(),
    createObjectif: vi.fn(),
    updateObjectif: vi.fn(),
    deleteObjectif: vi.fn(),
  },
  rdvsService: {
    getMyRdvs: vi.fn(),
    getRdvsByEntreprise: vi.fn(),
    getRdvById: vi.fn(),
    createRdv: vi.fn(),
    updateRdv: vi.fn(),
    deleteRdv: vi.fn(),
  },
}));

vi.mock("@tanstack/react-query", () => queryMocks);
vi.mock("@/store/authStore", () => authStoreMock);
vi.mock("@/services/ca", () => ({ caService: services.caService }));
vi.mock("@/services/contacts", () => ({ contactsService: services.contactsService }));
vi.mock("@/services/devis", () => ({ devisService: services.devisService }));
vi.mock("@/services/entreprises", () => ({
  entreprisesService: services.entreprisesService,
}));
vi.mock("@/services/notes", () => ({ notesService: services.notesService }));
vi.mock("@/services/objectifs", () => ({
  objectifsService: services.objectifsService,
}));
vi.mock("@/services/rdvs", () => ({ rdvsService: services.rdvsService }));

import {
  useCA,
  useCAEntreprise,
  useCAStats,
  useCreateCA,
  useDeleteCA,
  useUpdateCA,
} from "../../hooks/useCA";
import {
  useContact,
  useContacts,
  useCreateContact,
  useDeleteContact,
  useUpdateContact,
} from "../../hooks/useContacts";
import { useDeleteDevis, useDevis, useUploadDevis } from "../../hooks/useDevis";
import {
  useCreateEntreprise,
  useDeleteEntreprise,
  useEntreprise,
  useEntreprises,
  useUpdateEntreprise,
} from "../../hooks/useEntreprises";
import {
  useCreateNote,
  useDashboardClientsSuivi,
  useDeleteNote,
  useNote,
  useNotes,
  useSearchNotes,
  useTemplatesByType,
  useUpdateNote,
} from "../../hooks/useNotes";
import {
  useCreateObjectif,
  useDeleteObjectif,
  useObjectifs,
  useUpdateObjectif,
} from "../../hooks/useObjectifs";
import {
  useCreateRdv,
  useDeleteRdv,
  useMyRdvs,
  useRdvById,
  useRdvsByEntreprise,
  useUpdateRdv,
} from "../../hooks/useRdvs";

describe("data hooks", () => {
  beforeEach(() => {
    queryMocks.useQuery.mockClear();
    queryMocks.useMutation.mockClear();
    queryMocks.invalidateQueries.mockClear();
    Object.values(services).forEach((service) => {
      Object.values(service).forEach((mock) => mock.mockReset());
    });
  });

  it("configures CA queries and mutations", async () => {
    const caQuery = useCA({ annee: 2026 });
    await caQuery.queryFn();
    expect(services.caService.getCA).toHaveBeenCalledWith({ annee: 2026 });

    const statsQuery = useCAStats(2026, 6);
    await statsQuery.queryFn();
    expect(services.caService.getCAStats).toHaveBeenCalledWith(2026, 6);

    const entrepriseQuery = useCAEntreprise("e1", 2026);
    expect(entrepriseQuery.enabled).toBe(true);
    await entrepriseQuery.queryFn();
    expect(services.caService.getCAEntreprise).toHaveBeenCalledWith("e1", 2026);

    const createMutation = useCreateCA();
    await createMutation.mutationFn({ entreprise_id: "e1", annee: 2026, mois: 6, ca_ht: 1 });
    createMutation.onSuccess();
    expect(queryMocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["ca"] });

    const updateMutation = useUpdateCA();
    await updateMutation.mutationFn({ id: "ca1", data: { ca_ht: 2 } });
    expect(services.caService.updateCA).toHaveBeenCalledWith("ca1", { ca_ht: 2 });

    const deleteMutation = useDeleteCA();
    await deleteMutation.mutationFn("ca1");
    expect(services.caService.deleteCA).toHaveBeenCalledWith("ca1");
  });

  it("configures contacts hooks", async () => {
    const list = useContacts("e1");
    expect(list.enabled).toBe(true);
    await list.queryFn();
    expect(services.contactsService.getByEntreprise).toHaveBeenCalledWith("token", "e1");

    await useContact("c1").queryFn();
    expect(services.contactsService.getById).toHaveBeenCalledWith("token", "c1");

    const createMutation = useCreateContact();
    await createMutation.mutationFn({ entrepriseId: "e1", data: { nom: "Durand" } });
    createMutation.onSuccess(undefined, { entrepriseId: "e1" });
    expect(queryMocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["contacts", "e1"] });

    services.contactsService.update.mockResolvedValueOnce({ id: "c1", entreprise_id: "e1" });
    const updateMutation = useUpdateContact();
    const updated = await updateMutation.mutationFn({ id: "c1", data: { nom: "D" } });
    updateMutation.onSuccess(updated);
    expect(queryMocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["contacts", "detail", "c1"] });

    const deleteMutation = useDeleteContact();
    await deleteMutation.mutationFn({ id: "c1", entrepriseId: "e1" });
    expect(services.contactsService.delete).toHaveBeenCalledWith("token", "c1");
  });

  it("configures devis hooks", async () => {
    await useDevis("e1", "search").queryFn();
    expect(services.devisService.getByEntreprise).toHaveBeenCalledWith("e1", "search");

    const uploadMutation = useUploadDevis("e1");
    await uploadMutation.mutationFn({ nom: "D", file: {} as File });
    uploadMutation.onSuccess();
    expect(queryMocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["devis", "e1"] });

    const deleteMutation = useDeleteDevis("e1");
    await deleteMutation.mutationFn("d1");
    expect(services.devisService.delete).toHaveBeenCalledWith("d1");
  });

  it("configures entreprises hooks", async () => {
    await useEntreprises({ statut: "client" }).queryFn();
    expect(services.entreprisesService.getAll).toHaveBeenCalledWith("token", { statut: "client" });
    await useEntreprise("e1").queryFn();
    expect(services.entreprisesService.getById).toHaveBeenCalledWith("token", "e1");

    const createMutation = useCreateEntreprise();
    await createMutation.mutationFn({ nom: "ACME", statut: "client" });
    createMutation.onSuccess();
    expect(queryMocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["entreprises"] });

    const updateMutation = useUpdateEntreprise();
    await updateMutation.mutationFn({ id: "e1", data: { nom: "New" } });
    updateMutation.onSuccess(undefined, { id: "e1" });
    expect(queryMocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["entreprises", "e1"] });

    await useDeleteEntreprise().mutationFn("e1");
    expect(services.entreprisesService.delete).toHaveBeenCalledWith("token", "e1");
  });

  it("configures notes hooks", async () => {
    await useNotes("e1", { type: "info" }).queryFn();
    expect(services.notesService.getNotesByEntreprise).toHaveBeenCalledWith("token", "e1", { type: "info" });
    await useNote("n1").queryFn();
    expect(services.notesService.getNoteById).toHaveBeenCalledWith("token", "n1");

    const createMutation = useCreateNote();
    await createMutation.mutationFn({ entreprise_id: "e1", contenu: "A", type: "info" });
    createMutation.onSuccess(undefined, { entreprise_id: "e1" });
    expect(queryMocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["notes", "e1"] });

    services.notesService.updateNote.mockResolvedValueOnce({ entreprise_id: "e1" });
    const updateMutation = useUpdateNote();
    const note = await updateMutation.mutationFn({ id: "n1", updates: { contenu: "B" } });
    updateMutation.onSuccess(note);

    await useDeleteNote().mutationFn({ id: "n1", entrepriseId: "e1" });
    await useSearchNotes().mutationFn("relance");
    await useTemplatesByType("info").queryFn();
    await useDashboardClientsSuivi(7).queryFn();
    expect(services.notesService.getDashboardClientsSuivi).toHaveBeenCalledWith("token", 7);
  });

  it("configures objectifs hooks", async () => {
    await useObjectifs(2026).queryFn();
    expect(services.objectifsService.getObjectifs).toHaveBeenCalledWith(2026);

    const createMutation = useCreateObjectif();
    await createMutation.mutationFn({ annee: 2026, mois: 6, objectif_ht: 1000 });
    createMutation.onSuccess();
    expect(queryMocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["ca-stats"] });

    await useUpdateObjectif().mutationFn({ id: "o1", data: { objectif_ht: 1 } });
    await useDeleteObjectif().mutationFn("o1");
  });

  it("configures rdv hooks", async () => {
    await useMyRdvs({ statut: "planifie" }).queryFn();
    expect(services.rdvsService.getMyRdvs).toHaveBeenCalledWith("token", { statut: "planifie" });
    await useRdvsByEntreprise("e1", { page: 1 }).queryFn();
    expect(services.rdvsService.getRdvsByEntreprise).toHaveBeenCalledWith("token", "e1", { page: 1 });
    await useRdvById("r1").queryFn();
    expect(services.rdvsService.getRdvById).toHaveBeenCalledWith("token", "r1");

    const createMutation = useCreateRdv();
    await createMutation.mutationFn({
      entreprise_id: "e1",
      titre: "RDV",
      date_prevue: "2026-06-10T10:00:00.000Z",
      duree_minutes: 30,
    });
    createMutation.onSuccess();
    expect(queryMocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["rdvs"] });

    await useUpdateRdv().mutationFn({ id: "r1", updates: { statut: "annule" } });
    await useDeleteRdv().mutationFn("r1");
  });
});
