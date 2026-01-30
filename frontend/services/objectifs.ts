import { api } from "./api";

export interface Objectif {
  id: string;
  user_id: string;
  annee: number;
  mois: number;
  objectif_ht: number;
  created_at: string;
  updated_at: string;
}

export interface CreateObjectifInput {
  annee: number;
  mois: number;
  objectif_ht: number;
}

export interface UpdateObjectifInput {
  objectif_ht: number;
}

export const objectifsService = {
  getObjectifs: async (annee?: number): Promise<Objectif[]> => {
    const params = annee ? `?annee=${annee}` : "";
    const response = await api.get(`/v1/objectifs${params}`);
    return response.data.data;
  },

  createObjectif: async (input: CreateObjectifInput): Promise<Objectif> => {
    const response = await api.post("/v1/objectifs", input);
    return response.data.data;
  },

  updateObjectif: async (
    id: string,
    input: UpdateObjectifInput,
  ): Promise<Objectif> => {
    const response = await api.put(`/v1/objectifs/${id}`, input);
    return response.data.data;
  },

  deleteObjectif: async (id: string): Promise<void> => {
    await api.delete(`/v1/objectifs/${id}`);
  },
};
