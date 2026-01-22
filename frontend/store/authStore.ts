import { create } from "zustand";
import { authService, UserProfile } from "../services/auth";
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
  loadUser: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
}

const STORAGE_KEY = "auth_token";

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
      set({ error: error.response?.data?.error || "Login failed" });
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
      set({ error: error.response?.data?.error || "Registration failed" });
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
    } catch (error) {
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
    try {
      const savedToken = await storage.getItem(STORAGE_KEY);
      if (savedToken) {
        set({ token: savedToken });
        await get().loadUser();
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      await storage.removeItem(STORAGE_KEY);
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },
}));
