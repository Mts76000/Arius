import { Schema, model } from "mongoose";

export type RdvStatus = "planifie" | "termine" | "annule";

export interface RdvDocument {
  _id: string;
  user_id: string;
  entreprise_id: string;
  contact_id?: string; // Ref au contact (optionnel)
  titre: string;
  description?: string;
  date_prevue: Date;
  duree_minutes: number;
  statut: RdvStatus;
  createdAt: Date;
  updatedAt: Date;
}

const rdvSchema = new Schema<RdvDocument>(
  {
    _id: { type: String, required: true },
    user_id: { type: String, required: true, index: true },
    entreprise_id: { type: String, required: true, index: true },
    contact_id: { type: String, index: true },
    titre: { type: String, required: true },
    description: { type: String },
    date_prevue: { type: Date, required: true, index: true },
    duree_minutes: { type: Number, required: true, min: 1 },
    statut: {
      type: String,
      enum: ["planifie", "termine", "annule"],
      default: "planifie",
      index: true,
    },
  },
  { timestamps: true },
);

// Index composés pour les requêtes courantes
rdvSchema.index({ user_id: 1, date_prevue: -1 });
rdvSchema.index({ user_id: 1, statut: 1 });
rdvSchema.index({ entreprise_id: 1, date_prevue: -1 });

export const Rdv = model<RdvDocument>("Rdv", rdvSchema, "rdvs");
