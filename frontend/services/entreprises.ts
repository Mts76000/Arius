import { api } from "./api";
import type { EntrepriseStatus } from "@/shared/apiTypes";
import { Platform } from "react-native";

export interface Entreprise {
  id: string;
  user_id: string;
  nom: string;
  statut: EntrepriseStatus;
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
  statut: EntrepriseStatus;
  rue?: string;
  code_postal?: string;
  ville?: string;
  pays?: string;
  description?: string;
  logo?: string;
}

export interface EntrepriseLogoUpload {
  uri: string;
  filename: string;
  mimeType: string;
}

export interface UpdateEntrepriseInput {
  nom?: string;
  statut?: EntrepriseStatus;
  rue?: string;
  code_postal?: string;
  ville?: string;
  pays?: string;
  description?: string;
  logo?: string;
}

export interface GetEntreprisesParams {
  recherche?: string;
  statut?: EntrepriseStatus;
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

  async uploadLogo(
    token: string,
    entrepriseId: string,
    logo: EntrepriseLogoUpload,
  ): Promise<string> {
    const formData = new FormData();
    formData.append("entrepriseId", entrepriseId);

    if (Platform.OS === "web") {
      const response = await fetch(logo.uri);
      const blob = await response.blob();
      formData.append("image", blob, logo.filename);
    } else {
      formData.append("image", {
        uri: logo.uri,
        type: logo.mimeType,
        name: logo.filename,
      } as any);
    }

    const response = await fetch(`${api.defaults.baseURL}/v1/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Logo upload failed");
    }

    const data = await response.json();
    return data.url;
  },
};
