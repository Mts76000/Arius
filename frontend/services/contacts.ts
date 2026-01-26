import { api } from "./api";

export interface Contact {
  id: string;
  user_id: string;
  entreprise_id: string;
  prenom: string | null;
  nom: string;
  poste: string | null;
  email: string | null;
  tel_direct: string | null;
  tel_mobile: string | null;
  contact_principal: boolean;
  commentaire: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateContactInput {
  prenom?: string;
  nom: string;
  poste?: string;
  email?: string;
  tel_direct?: string;
  tel_mobile?: string;
  contact_principal?: boolean;
  commentaire?: string;
}

export interface UpdateContactInput {
  prenom?: string;
  nom?: string;
  poste?: string;
  email?: string;
  tel_direct?: string;
  tel_mobile?: string;
  contact_principal?: boolean;
  commentaire?: string;
}

export const contactsService = {
  async getByEntreprise(
    token: string,
    entrepriseId: string,
  ): Promise<Contact[]> {
    const response = await api.get<Contact[]>(
      `/v1/entreprises/${entrepriseId}/contacts`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  async getById(token: string, id: string): Promise<Contact> {
    const response = await api.get<Contact>(`/v1/contacts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async create(
    token: string,
    entrepriseId: string,
    data: CreateContactInput,
  ): Promise<Contact> {
    const response = await api.post<Contact>(
      `/v1/entreprises/${entrepriseId}/contacts`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  async update(
    token: string,
    id: string,
    data: UpdateContactInput,
  ): Promise<Contact> {
    const response = await api.put<Contact>(`/v1/contacts/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async delete(token: string, id: string): Promise<void> {
    await api.delete(`/v1/contacts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
