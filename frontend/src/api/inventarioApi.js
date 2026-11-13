import axios from 'axios';

const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL}/inventario` });

// Nuevo: el backend pide token, se manda en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Insumos
// Cambio: el backend responde { ok, insumos }, se saca la lista
export const getInsumos = () => api.get('/insumos').then((r) => r.data.insumos);
export const crearInsumo = (datos) => api.post('/insumos', datos);
export const editarInsumo = (id, datos) => api.put(`/insumos/${id}`, datos);
export const eliminarInsumo = (id) => api.delete(`/insumos/${id}`);

// Productos y recetas
// Cambio: igual, se saca productos / producto de la respuesta
export const getProductos = () => api.get('/productos').then((r) => r.data.productos);
export const getProducto = (id) => api.get(`/productos/${id}`).then((r) => r.data.producto);
export const crearProducto = (datos) => api.post('/productos', datos);
export const editarProducto = (id, datos) => api.put(`/productos/${id}`, datos);
export const eliminarProducto = (id) => api.delete(`/productos/${id}`);
export const guardarReceta = (id, lineas) => api.put(`/productos/${id}/receta`, { lineas });

// Alertas
// Cambio: se saca alertas de la respuesta
export const getAlertas = () => api.get('/alertas').then((r) => r.data.alertas);