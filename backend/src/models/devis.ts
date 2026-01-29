import { Schema, model } from "mongoose";

export interface DevisDocument {
  _id: string;
  user_id: string;
  entreprise_id: string;
  nom: string;
  notes?: string;
  nom_fichier: string;
  url_fichier: string;
  type_mime: string;
  taille_octets: number;
  createdAt: Date;
  updatedAt: Date;
}

const devisSchema = new Schema<DevisDocument>(
  {
    _id: { type: String, required: true },
    user_id: { type: String, required: true, index: true },
    entreprise_id: { type: String, required: true, index: true },
    nom: { type: String, required: true },
    notes: { type: String },
    nom_fichier: { type: String, required: true },
    url_fichier: { type: String, required: true },
    type_mime: { type: String, required: true },
    taille_octets: { type: Number, required: true },
  },
  { timestamps: true }
);

// Index composés
devisSchema.index({ user_id: 1, entreprise_id: 1, createdAt: -1 });

export const Devis = model<DevisDocument>("Devis", devisSchema, "devis");
