import axios from "axios";
import Constants from "expo-constants";

const baseURL = Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:3000";

// Axios expose bien create sur l'export par defaut.
// eslint-disable-next-line import/no-named-as-default-member
export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface AuthInterceptorConfig {
  getToken: () => string | null;
  logout: () => void;
}

// Les intercepteurs seront configurés après l'initialisation du store
export function setupAuthInterceptors(config: AuthInterceptorConfig) {
  // Ajouter un interceptor pour les requêtes sortantes
  api.interceptors.request.use((requestConfig) => {
    const token = config.getToken();
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    return requestConfig;
  });

  // Ajouter un interceptor pour les réponses
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expiré ou invalide
        config.logout();
      }
      return Promise.reject(error);
    },
  );
}
