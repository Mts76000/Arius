import { Request, Response } from "express";
import * as NoteModel from "../models/note.js";
import {
  createNoteSchema,
  dashboardNotesQuerySchema,
  listNotesQuerySchema,
  noteTemplatesQuerySchema,
  searchNotesQuerySchema,
  updateNoteSchema,
} from "../validation/noteSchemas.js";
import {
  sendError,
  sendInternalError,
  sendValidationError,
} from "../http/apiResponse.js";

const normalizeNoteType = (value: unknown) => {
  if (typeof value !== "string") return value;

  const normalized = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const map: Record<string, string> = {
    appel: "appel",
    reunion: "reunion",
    email: "email",
    info: "info",
    autre: "autre",
  };

  return map[normalized] || value;
};

const normalizeCreateNotePayload = (body: any) => ({
  entreprise_id:
    typeof body?.entreprise_id === "string"
      ? body.entreprise_id
      : typeof body?.entrepriseId === "string"
        ? body.entrepriseId
        : "",
  contenu: typeof body?.contenu === "string" ? body.contenu.trim() : "",
  type: normalizeNoteType(body?.type),
  tags: Array.isArray(body?.tags) ? body.tags : undefined,
  est_template:
    typeof body?.est_template === "boolean"
      ? body.est_template
      : typeof body?.estTemplate === "boolean"
        ? body.estTemplate
        : undefined,
  nom_template:
    typeof body?.nom_template === "string" || body?.nom_template === null
      ? body.nom_template
      : typeof body?.nomTemplate === "string" || body?.nomTemplate === null
        ? body.nomTemplate
        : undefined,
});

export async function listByEntreprise(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    const { id: entrepriseId } = req.params;
    const parsedQuery = listNotesQuerySchema.safeParse(
      req.validatedQuery ?? req.query,
    );
    if (!parsedQuery.success) return sendValidationError(res, parsedQuery.error);
    const { type, tag, page, limite } = parsedQuery.data;

    if (!userId) return sendError(res, 401, "unauthorized", "Non authentifie");

    const filters = {
      type: type as NoteModel.NoteType | undefined,
      tag: tag as string | undefined,
      page,
      limite,
    };

    const result = await NoteModel.getNotesByEntreprise(
      entrepriseId as string,
      userId,
      filters,
    );

    res.json(result);
  } catch {
    sendInternalError(res);
  }
}

export async function get(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    const { id } = req.params;

    if (!userId) return sendError(res, 401, "unauthorized", "Non authentifie");

    const note = await NoteModel.getNoteById(id as string, userId);
    if (!note) {
      return sendError(res, 404, "not_found", "Note introuvable");
    }

    res.json(note);
  } catch {
    sendInternalError(res);
  }
}

export async function create(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    if (!userId) return sendError(res, 401, "unauthorized", "Non authentifie");

    const parsed = createNoteSchema.safeParse(
      normalizeCreateNotePayload(req.validatedBody ?? req.body),
    );
    if (!parsed.success) {
      return sendValidationError(res, parsed.error);
    }

    const note = await NoteModel.createNote(userId, parsed.data);
    res.status(201).json(note);
  } catch {
    sendInternalError(res);
  }
}

export async function update(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    const { id } = req.params;

    if (!userId) return sendError(res, 401, "unauthorized", "Non authentifie");

    const parsed = updateNoteSchema.safeParse(req.validatedBody ?? req.body);
    if (!parsed.success) {
      return sendValidationError(res, parsed.error);
    }

    const note = await NoteModel.updateNote(id as string, userId, parsed.data);
    if (!note) {
      return sendError(res, 404, "not_found", "Note introuvable");
    }

    res.json(note);
  } catch {
    sendInternalError(res);
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    const { id } = req.params;

    if (!userId) return sendError(res, 401, "unauthorized", "Non authentifie");

    const deleted = await NoteModel.deleteNote(id as string, userId);
    if (!deleted) {
      return sendError(res, 404, "not_found", "Note introuvable");
    }

    res.json({ success: true });
  } catch {
    sendInternalError(res);
  }
}

export async function search(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    const parsedQuery = searchNotesQuerySchema.safeParse(
      req.validatedQuery ?? req.query,
    );
    if (!parsedQuery.success) return sendValidationError(res, parsedQuery.error);
    const { q } = parsedQuery.data;

    if (!userId) return sendError(res, 401, "unauthorized", "Non authentifie");

    const notes = await NoteModel.searchNotes(userId, q);
    res.json(notes);
  } catch {
    sendInternalError(res);
  }
}

export async function getTemplates(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    const parsedQuery = noteTemplatesQuerySchema.safeParse(
      req.validatedQuery ?? req.query,
    );
    if (!parsedQuery.success) return sendValidationError(res, parsedQuery.error);
    const { type } = parsedQuery.data;

    if (!userId) return sendError(res, 401, "unauthorized", "Non authentifie");

    const templates = await NoteModel.getTemplatesByType(
      userId,
      type,
    );
    res.json(templates);
  } catch {
    sendInternalError(res);
  }
}

export async function getDashboard(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    const parsedQuery = dashboardNotesQuerySchema.safeParse(
      req.validatedQuery ?? req.query,
    );
    if (!parsedQuery.success) return sendValidationError(res, parsedQuery.error);
    const { jours_seuil } = parsedQuery.data;

    if (!userId) return sendError(res, 401, "unauthorized", "Non authentifie");

    const data = await NoteModel.getNotesForDashboard(userId, jours_seuil);
    res.json(data);
  } catch {
    sendInternalError(res);
  }
}
