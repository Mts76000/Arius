import { api } from "./api";

export interface Entreprise {
  id: string;
  user_id: string;
  nom: string;
  statut: "client" | "prospect" | "fournisseur" | "a_reactiver";
  rue: string | null;
  code_postal: string | null;
  ville: string | null;
  pays: string | null;
  description: string | null;
  logo: string | null;
  contacts_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateEntrepriseInput {
  nom: string;
  statut: "client" | "prospect" | "fournisseur" | "a_reactiver";
  rue?: string;
  code_postal?: string;
  ville?: string;
  pays?: string;
  description?: string;
  logo?: string;
}

export interface UpdateEntrepriseInput {
  nom?: string;
  statut?: "client" | "prospect" | "fournisseur" | "a_reactiver";
  rue?: string;
  code_postal?: string;
  ville?: string;
  pays?: string;
  description?: string;
  logo?: string;
}

export interface GetEntreprisesParams {
  recherche?: string;
  statut?: "client" | "prospect" | "fournisseur" | "a_reactiver";
  page?: number;
  limite?: number;
}

export interface GetEntreprisesResponse {
  entreprises: Entreprise[];
  total: number;
}

export const entreprisesService = {
  async getAll(
    token: string,
    params?: GetEntreprisesParams,
  ): Promise<GetEntreprisesResponse> {
    const response = await api.get<GetEntreprisesResponse>("/v1/entreprises", {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return response.data;
  },

  async getById(token: string, id: string): Promise<Entreprise> {
    const response = await api.get<Entreprise>(`/v1/entreprises/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async create(
    token: string,
    data: CreateEntrepriseInput,
  ): Promise<Entreprise> {
    const response = await api.post<Entreprise>("/v1/entreprises", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async update(
    token: string,
    id: string,
    data: UpdateEntrepriseInput,
  ): Promise<Entreprise> {
    const response = await api.put<Entreprise>(`/v1/entreprises/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async delete(token: string, id: string): Promise<void> {
    await api.delete(`/v1/entreprises/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
