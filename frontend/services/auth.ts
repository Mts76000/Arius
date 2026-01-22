import { api } from "./api";

export interface AuthResponse {
  token: string;
}

export interface UserProfile {
  id: string;
  email: string;
  prenom: string | null;
  nom: string | null;
}

export const authService = {
  async register(
    email: string,
    password: string,
    prenom?: string,
    nom?: string,
  ): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/v1/auth/register", {
      email,
      password,
      prenom,
      nom,
    });
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/v1/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  async getMe(token: string): Promise<UserProfile> {
    const response = await api.get<UserProfile>("/v1/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
