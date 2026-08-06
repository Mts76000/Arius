import { create } from "zustand";
import { authService, UserProfile } from "../services/auth";
import { setupAuthInterceptors } from "../services/api";
import { storage } from "../utils/storage";

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    prenom?: string,
    nom?: string,
  ) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  loadUser: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
}

const STORAGE_KEY = "auth_token";

function getFrenchAuthError(error: any, fallback: string): string {
  const apiMessage = (error?.response?.data?.error || "")
    .toString()
    .toLowerCase();

  if (
    apiMessage.includes("invalid") ||
    apiMessage.includes("credentials") ||
    apiMessage.includes("unauthorized") ||
    apiMessage.includes("incorrect")
  ) {
    return "Email ou mot de passe incorrect.";
  }

  if (apiMessage.includes("already") || apiMessage.includes("exists")) {
    return "Ce compte existe deja.";
  }

  if (apiMessage.includes("network") || !error?.response) {
    return "Impossible de contacter le serveur. Verifie ta connexion.";
  }

  return error?.response?.data?.error || fallback;
}

function getFrenchResetPasswordError(error: any): string {
  const apiMessage = (error?.response?.data?.message ||
    error?.response?.data?.error ||
    "")
    .toString()
    .toLowerCase();

  if (
    apiMessage.includes("invalid_reset_token") ||
    apiMessage.includes("lien invalide") ||
    apiMessage.includes("expire") ||
    apiMessage.includes("token")
  ) {
    return "Ce lien de réinitialisation est invalide ou déjà utilisé. Redemande un nouveau lien.";
  }

  if (apiMessage.includes("network") || !error?.response) {
    return "Impossible de contacter le serveur. Verifie ta connexion.";
  }

  return "Impossible de modifier le mot de passe. Redemande un nouveau lien.";
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isLoading: false,
  error: null,
  isInitialized: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { token } = await authService.login(email, password);
      set({ token });
      await storage.setItem(STORAGE_KEY, token);
      await get().loadUser();
    } catch (error: any) {
      set({ error: getFrenchAuthError(error, "Echec de la connexion.") });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (
    email: string,
    password: string,
    prenom?: string,
    nom?: string,
  ) => {
    set({ isLoading: true, error: null });
    try {
      const { token } = await authService.register(
        email,
        password,
        prenom,
        nom,
      );
      set({ token });
      await storage.setItem(STORAGE_KEY, token);
      await get().loadUser();
    } catch (error: any) {
      set({ error: getFrenchAuthError(error, "Echec de l'inscription.") });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await authService.forgotPassword(email);
    } catch (error: any) {
      set({
        error: getFrenchAuthError(
          error,
          "Impossible d'envoyer le lien de réinitialisation.",
        ),
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (token: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await authService.resetPassword(token, password);
    } catch (error: any) {
      set({
        error: getFrenchResetPasswordError(error),
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  loadUser: async () => {
    const { token } = get();
    if (!token) return;

    try {
      const user = await authService.getMe(token);
      set({ user });
    } catch {
      set({ token: null, user: null });
      await storage.removeItem(STORAGE_KEY);
    }
  },

  logout: () => {
    set({ token: null, user: null, error: null });
    storage.removeItem(STORAGE_KEY);
  },

  clearError: () => {
    set({ error: null });
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    // Initialiser les intercepteurs au premier démarrage
    setupAuthInterceptors({
      getToken: () => get().token,
      logout: () => get().logout(),
    });
    try {
      const savedToken = await storage.getItem(STORAGE_KEY);
      if (savedToken) {
        set({ token: savedToken });
        await get().loadUser();
      }
    } catch {
      await storage.removeItem(STORAGE_KEY);
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },
}));
