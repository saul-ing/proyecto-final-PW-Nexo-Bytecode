import axios from 'axios';

// Crea una instancia para un módulo (ej. crearApi('/compras')) con el token y el manejo de sesión vencida
export function crearApi(ruta = '') {
  const instancia = axios.create({ baseURL: `${import.meta.env.VITE_API_URL}${ruta}` });

  // Agrega el token a cada petición
  instancia.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Si el token venció, vuelve al login
  instancia.interceptors.response.use(
    (res) => res,
    (error) => {
      const esLogin = error.config?.url?.includes('/auth/login');
      if (error.response?.status === 401 && !esLogin) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instancia;
}

const api = crearApi();

export default api;
