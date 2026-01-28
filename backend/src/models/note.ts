import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export type NoteType = "appel" | "reunion" | "email" | "info" | "autre";

export interface INote extends Document<string> {
  _id: string;
  user_id: string;
  entreprise_id: string;
  contenu: string;
  type: NoteType;
  est_template: boolean;
  nom_template?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateNoteInput {
  entreprise_id: string;
  contenu: string;
  type: NoteType;
  est_template?: boolean;
  nom_template?: string | null;
}

export interface UpdateNoteInput {
  contenu?: string;
  type?: NoteType;
  est_template?: boolean;
  nom_template?: string | null;
}

export interface GetNotesFilters {
  type?: NoteType;
  page?: number;
  limite?: number;
}

const noteSchema = new Schema<INote>(
  {
    _id: { type: String, default: () => uuidv4() },
    user_id: { type: String, required: true, index: true },
    entreprise_id: { type: String, required: true, index: true },
    contenu: { type: String, required: true },
    type: {
      type: String,
      enum: ["appel", "reunion", "email", "info", "autre"],
      required: true,
    },
    est_template: { type: Boolean, default: false },
    nom_template: { type: String, default: null },
  },
  {
    timestamps: true,
    collection: "notes",
  },
);

// Indexes
noteSchema.index({ user_id: 1, entreprise_id: 1, createdAt: -1 });
noteSchema.index({ est_template: 1, type: 1 });

export const Note = mongoose.model<INote>("Note", noteSchema);

// Functions
export async function getNotesByEntreprise(
  entrepriseId: string,
  userId: string,
  filters: GetNotesFilters = {},
): Promise<{ notes: INote[]; total: number }> {
  const { type, page = 1, limite = 20 } = filters;
  const skip = (page - 1) * limite;

  const query: any = { user_id: userId, entreprise_id: entrepriseId };
  if (type) query.type = type;

  const [notes, total] = await Promise.all([
    Note.find(query).sort({ createdAt: -1 }).skip(skip).limit(limite),
    Note.countDocuments(query),
  ]);

  return { notes, total };
}

export async function getNoteById(
  id: string,
  userId: string,
): Promise<INote | null> {
  return Note.findOne({ _id: id, user_id: userId });
}

export async function createNote(
  userId: string,
  input: CreateNoteInput,
): Promise<INote> {
  const note = new Note({
    user_id: userId,
    entreprise_id: input.entreprise_id,
    contenu: input.contenu,
    type: input.type,
    est_template: input.est_template ?? false,
    nom_template: input.nom_template ?? null,
  });

  await note.save();
  return note;
}

export async function updateNote(
  id: string,
  userId: string,
  input: UpdateNoteInput,
): Promise<INote | null> {
  return Note.findOneAndUpdate({ _id: id, user_id: userId }, input, {
    new: true,
  });
}

export async function deleteNote(id: string, userId: string): Promise<boolean> {
  const result = await Note.deleteOne({ _id: id, user_id: userId });
  return result.deletedCount > 0;
}

export async function searchNotes(
  userId: string,
  query: string,
): Promise<INote[]> {
  return Note.find(
    { user_id: userId, contenu: { $regex: query, $options: "i" } },
    null,
    { limit: 50 },
  ).sort({ created_at: -1 });
}

export async function getNotesByTags(
  userId: string,
  tags: string[],
): Promise<INote[]> {
  if (tags.length === 0) return [];
  return Note.find({ user_id: userId, tags: { $in: tags } }).sort({
    created_at: -1,
  });
}

export async function getNotesForDashboard(
  userId: string,
  dayThreshold: number = 7,
): Promise<any[]> {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - dayThreshold);

  // Aggregate pour grouper par entreprise_id et trouver la dernière note
  return Note.aggregate([
    {
      $match: {
        user_id: userId,
        created_at: { $lt: thresholdDate },
      },
    },
    {
      $sort: { created_at: -1 },
    },
    {
      $group: {
        _id: "$entreprise_id",
        dernier_contact: { $first: "$created_at" },
        derniere_note: { $first: "$contenu" },
      },
    },
    {
      $addFields: {
        jours_ecules: {
          $divide: [
            { $subtract: [new Date(), "$dernier_contact"] },
            1000 * 60 * 60 * 24,
          ],
        },
      },
    },
    {
      $sort: { jours_ecules: -1 },
    },
  ]);
}

export async function getTemplatesByType(
  userId: string,
  type: NoteType,
): Promise<INote[]> {
  return Note.find({
    user_id: userId,
    est_template: true,
    type: type,
  }).sort({ nom_template: 1 });
}
