import axios from "axios";
import Constants from "expo-constants";

const baseURL = Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:3000";

export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Les intercepteurs seront configurés après l'initialisation du store
export function setupAuthInterceptors() {
  // Import tardif pour éviter la boucle circulaire
  const { useAuthStore } = require("@/store/authStore");

  // Ajouter un interceptor pour les requêtes sortantes
  api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Ajouter un interceptor pour les réponses
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expiré ou invalide
        useAuthStore.getState().logout();
      }
      return Promise.reject(error);
    },
  );
}
