import { api } from "./api";

export type RdvStatus =
  | "planifie"
  | "en_cours"
  | "termine"
  | "annule"
  | "reporte";

export interface Rdv {
  _id: string;
  user_id: string;
  entreprise_id: string;
  contact_id?: string;
  titre: string;
  description?: string;
  date_prevue: string;
  duree_minutes: number;
  statut: RdvStatus;
  note_id?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRdvInput {
  titre: string;
  description?: string;
  date_prevue: string;
  duree_minutes: number;
  entreprise_id: string;
  contact_id?: string;
  statut?: RdvStatus;
}

export interface UpdateRdvInput {
  titre?: string;
  description?: string;
  date_prevue?: string;
  duree_minutes?: number;
  statut?: RdvStatus;
}

export interface GetRdvsResponse {
  rdvs: Rdv[];
  pagination?: { page: number; limite: number; total: number };
}

export const rdvsService = {
  async getMyRdvs(
    token: string,
    filters?: {
      statut?: RdvStatus;
      de?: string;
      a?: string;
      page?: number;
      limite?: number;
    },
  ): Promise<GetRdvsResponse> {
    const params = new URLSearchParams();
    if (filters?.statut) params.append("statut", filters.statut);
    if (filters?.de) params.append("de", filters.de);
    if (filters?.a) params.append("a", filters.a);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limite) params.append("limite", filters.limite.toString());

    const queryStr = params.toString();
    const url = queryStr ? `/v1/rdvs?${queryStr}` : "/v1/rdvs";
    const response = await api.get<GetRdvsResponse>(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async getRdvsByEntreprise(
    token: string,
    entrepriseId: string,
  ): Promise<GetRdvsResponse> {
    const response = await api.get<GetRdvsResponse>(
      `/v1/entreprises/${entrepriseId}/rdvs`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  async getRdvById(token: string, id: string): Promise<Rdv> {
    const response = await api.get<Rdv>(`/v1/rdvs/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async createRdv(token: string, rdv: CreateRdvInput): Promise<Rdv> {
    const response = await api.post<Rdv>("/v1/rdvs", rdv, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async updateRdv(
    token: string,
    id: string,
    updates: UpdateRdvInput,
  ): Promise<Rdv> {
    const response = await api.put<Rdv>(`/v1/rdvs/${id}`, updates, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async deleteRdv(token: string, id: string): Promise<void> {
    await api.delete(`/v1/rdvs/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
