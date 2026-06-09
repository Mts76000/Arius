import { Request, Response } from "express";
import * as NoteModel from "../models/note.js";
import { z } from "zod";

const CreateNoteSchema = z.object({
  entreprise_id: z.string().min(1),
  contenu: z.string().min(1),
  type: z.enum(["appel", "reunion", "email", "info", "autre"]),
  tags: z.array(z.string()).optional(),
  est_template: z.boolean().optional(),
  nom_template: z.string().optional().nullable(),
});

const UpdateNoteSchema = z.object({
  contenu: z.string().min(1).optional(),
  type: z.enum(["appel", "reunion", "email", "info", "autre"]).optional(),
  tags: z.array(z.string()).optional(),
  est_template: z.boolean().optional(),
  nom_template: z.string().optional().nullable(),
});

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
    const { type, tag, page, limite } = req.query;

    if (!userId) return res.status(401).json({ error: "unauthorized" });

    const filters = {
      type: type as NoteModel.NoteType | undefined,
      tag: tag as string | undefined,
      page: page ? parseInt(page as string) : 1,
      limite: limite ? parseInt(limite as string) : 20,
    };

    const result = await NoteModel.getNotesByEntreprise(
      entrepriseId as string,
      userId,
      filters,
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notes" });
  }
}

export async function get(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ error: "unauthorized" });

    const note = await NoteModel.getNoteById(id as string, userId);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(note);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch note" });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    if (!userId) return res.status(401).json({ error: "unauthorized" });

    const parsed = CreateNoteSchema.safeParse(
      normalizeCreateNotePayload(req.body),
    );
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.errors,
        message: "Payload note invalide",
      });
    }

    const note = await NoteModel.createNote(userId, parsed.data);
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: "Failed to create note" });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ error: "unauthorized" });

    const parsed = UpdateNoteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }

    const note = await NoteModel.updateNote(id as string, userId, parsed.data);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(note);
  } catch (err) {
    res.status(500).json({ error: "Failed to update note" });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ error: "unauthorized" });

    const deleted = await NoteModel.deleteNote(id as string, userId);
    if (!deleted) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete note" });
  }
}

export async function search(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    const { q } = req.query;

    if (!userId) return res.status(401).json({ error: "unauthorized" });
    if (!q || typeof q !== "string") {
      return res.status(400).json({ error: "Query required" });
    }

    const notes = await NoteModel.searchNotes(userId, q);
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
}

export async function getTemplates(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    const { type } = req.query;

    if (!userId) return res.status(401).json({ error: "unauthorized" });
    if (
      !type ||
      !["appel", "reunion", "email", "info", "autre"].includes(type as string)
    ) {
      return res.status(400).json({ error: "Valid type required" });
    }

    const templates = await NoteModel.getTemplatesByType(
      userId,
      type as NoteModel.NoteType,
    );
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch templates" });
  }
}

export async function getDashboard(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    const { jours_seuil } = req.query;

    if (!userId) return res.status(401).json({ error: "unauthorized" });

    const threshold = jours_seuil ? parseInt(jours_seuil as string) : 7;

    const data = await NoteModel.getNotesForDashboard(userId, threshold);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Dashboard fetch failed" });
  }
}
