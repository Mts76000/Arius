import { api } from "./api";

export interface ProfilData {
  id: string;
  email: string;
  prenom: string | null;
  nom: string | null;
  created_at: string;
}

export async function getProfil(): Promise<ProfilData> {
  const response = await api.get("/v1/utilisateurs/profil");
  return response.data;
}

export async function updateProfil(data: {
  prenom: string;
  nom: string;
}): Promise<ProfilData> {
  const response = await api.patch("/v1/utilisateurs/profil", data);
  return response.data;
}

export async function changerMotdepasse(data: {
  ancienMotdepasse: string;
  nouveauMotdepasse: string;
  confirmation: string;
}): Promise<{ message: string }> {
  const response = await api.post("/v1/utilisateurs/changer-motdepasse", data);
  return response.data;
}

export async function anonymiserCompte(data: {
  motdepasse: string;
}): Promise<{ message: string }> {
  const response = await api.post("/v1/utilisateurs/anonymiser-compte", data);
  return response.data;
}
