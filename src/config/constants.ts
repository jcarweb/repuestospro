// Configuración centralizada para URLs de API
export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
export const API_URL = `${API_BASE_URL}/api`;

// Función helper para construir URLs de API
export const buildApiUrl = (endpoint: string) => `${API_URL}${endpoint}`;
