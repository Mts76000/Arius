import { api } from "./api";

export interface Devis {
  _id: string;
  user_id: string;
  entreprise_id: string;
  nom: string;
  notes?: string;
  nom_fichier: string;
  url_fichier: string;
  type_mime: string;
  taille_octets: number;
  createdAt: string;
  updatedAt: string;
}

export interface UploadDevisInput {
  nom: string;
  notes?: string;
  file: File | { uri: string; type: string; name: string; size?: number };
}

export const devisService = {
  async getByEntreprise(
    entrepriseId: string,
    search?: string,
  ): Promise<Devis[]> {
    const params = search ? { search } : {};
    const response = await api.get(`/v1/entreprises/${entrepriseId}/devis`, {
      params,
    });
    return response.data.devis || [];
  },

  async get(id: string): Promise<Devis> {
    const response = await api.get(`/v1/devis/${id}`);
    return response.data;
  },

  async upload(entrepriseId: string, data: UploadDevisInput): Promise<Devis> {
    const formData = new FormData();
    formData.append("nom", data.nom);
    if (data.notes) formData.append("notes", data.notes);
    formData.append("file", data.file as any);

    // Don't set Content-Type header - let axios/browser handle it for FormData
    const response = await api.post(
      `/v1/entreprises/${entrepriseId}/devis`,
      formData,
      {
        headers: {
          "Content-Type": undefined,
        },
      },
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/v1/devis/${id}`);
  },

  getFileUrl(urlFichier: string): string {
    return `${api.defaults.baseURL}${urlFichier}`;
  },

  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  },
};
