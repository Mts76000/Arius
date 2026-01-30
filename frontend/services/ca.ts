import { api } from "./api";

export interface CAMensuel {
  id: string;
  user_id: string;
  entreprise_id: string;
  annee: number;
  mois: number;
  ca_ht: number;
  created_at: string;
  updated_at: string;
}

export interface CAMensuelAvecEntreprise extends CAMensuel {
  entreprise_nom: string;
  entreprise_logo?: string;
}

export interface CreateCAInput {
  entreprise_id: string;
  annee: number;
  mois: number;
  ca_ht: number;
}

export interface UpdateCAInput {
  ca_ht: number;
}

export interface GetCAParams {
  annee?: number;
  mois?: number;
  entreprise_id?: string;
}

export interface CAParEntreprise {
  entreprise_id: string;
  entreprise_nom: string;
  entreprise_logo: string | null;
  ca_total: number;
}

export interface CAStats {
  ca_total: number;
  objectif: number | null;
  progression: number | null;
  ca_par_entreprise: CAParEntreprise[];
}

export interface CAEntrepriseStats {
  ca_total: number;
  moyenne_mensuelle: number;
  ca_mensuel: CAMensuel[];
}

export const caService = {
  getCA: async (params?: GetCAParams): Promise<CAMensuelAvecEntreprise[]> => {
    const queryParams = new URLSearchParams();
    if (params?.annee) queryParams.append("annee", params.annee.toString());
    if (params?.mois) queryParams.append("mois", params.mois.toString());
    if (params?.entreprise_id)
      queryParams.append("entreprise_id", params.entreprise_id);

    const query = queryParams.toString();
    const response = await api.get(`/v1/ca${query ? `?${query}` : ""}`);
    return response.data.data;
  },

  createCA: async (input: CreateCAInput): Promise<CAMensuel> => {
    const response = await api.post("/v1/ca", input);
    return response.data.data;
  },

  updateCA: async (id: string, input: UpdateCAInput): Promise<CAMensuel> => {
    const response = await api.put(`/v1/ca/${id}`, input);
    return response.data.data;
  },

  deleteCA: async (id: string): Promise<void> => {
    await api.delete(`/v1/ca/${id}`);
  },

  getCAStats: async (annee: number, mois: number): Promise<CAStats> => {
    const response = await api.get(`/v1/ca/stats?annee=${annee}&mois=${mois}`);
    return response.data.data;
  },

  getCAEntreprise: async (
    entrepriseId: string,
    annee: number,
  ): Promise<CAEntrepriseStats> => {
    const response = await api.get(
      `/v1/ca/entreprise/${entrepriseId}?annee=${annee}`,
    );
    return response.data.data;
  },
};
