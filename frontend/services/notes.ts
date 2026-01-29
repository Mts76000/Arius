import { api } from "./api";

export type NoteType = "appel" | "reunion" | "email" | "info" | "autre";

export interface Note {
  _id: string;
  user_id: string;
  entreprise_id: string;
  contenu: string;
  type: NoteType;
  est_template: boolean;
  nom_template: string | null;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface CreateNoteInput {
  entreprise_id: string;
  contenu: string;
  type: NoteType;
  est_template?: boolean;
  nom_template?: string | null;
}

export interface GetNotesFilters {
  type?: NoteType;
  tag?: string;
  page?: number;
  limite?: number;
}

export interface GetNotesResponse {
  notes: Note[];
  total: number;
}

export const notesService = {
  async getNotesByEntreprise(
    token: string,
    entrepriseId: string,
    filters?: GetNotesFilters,
  ): Promise<GetNotesResponse> {
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.tag) params.append("tag", filters.tag);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limite) params.append("limite", filters.limite.toString());

    const queryStr = params.toString();
    const url = queryStr
      ? `/v1/entreprises/${entrepriseId}/notes?${queryStr}`
      : `/v1/entreprises/${entrepriseId}/notes`;
    const response = await api.get<GetNotesResponse>(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async getNoteById(token: string, id: string): Promise<Note> {
    const response = await api.get<Note>(`/v1/notes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async createNote(token: string, note: CreateNoteInput): Promise<Note> {
    const response = await api.post<Note>("/v1/notes", note, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async updateNote(
    token: string,
    id: string,
    updates: Partial<CreateNoteInput>,
  ): Promise<Note> {
    const response = await api.put<Note>(`/v1/notes/${id}`, updates, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async deleteNote(token: string, id: string): Promise<void> {
    await api.delete(`/v1/notes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async searchNotes(token: string, query: string): Promise<Note[]> {
    const response = await api.get<Note[]>(
      `/v1/notes/search?q=${encodeURIComponent(query)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  },

  async getTemplatesByType(token: string, type: NoteType): Promise<Note[]> {
    const response = await api.get<Note[]>(`/v1/templates/notes?type=${type}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async getDashboardClientsSuivi(
    token: string,
    jours_seuil?: number,
  ): Promise<any[]> {
    const params = jours_seuil ? `?jours_seuil=${jours_seuil}` : "";
    const response = await api.get<any[]>(
      `/v1/dashboard/clients-suivi${params}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  },
};
