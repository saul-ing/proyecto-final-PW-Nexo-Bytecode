import axios from 'axios';

const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL}/inventario` });

// Insumos
export const getInsumos = () => api.get('/insumos').then((r) => r.data);
export const crearInsumo = (datos) => api.post('/insumos', datos);
export const editarInsumo = (id, datos) => api.put(`/insumos/${id}`, datos);
export const eliminarInsumo = (id) => api.delete(`/insumos/${id}`);

// Productos y recetas
export const getProductos = () => api.get('/productos').then((r) => r.data);
export const getProducto = (id) => api.get(`/productos/${id}`).then((r) => r.data);
export const crearProducto = (datos) => api.post('/productos', datos);
export const editarProducto = (id, datos) => api.put(`/productos/${id}`, datos);
export const eliminarProducto = (id) => api.delete(`/productos/${id}`);
export const guardarReceta = (id, lineas) => api.put(`/productos/${id}/receta`, { lineas });

// Alertas
export const getAlertas = () => api.get('/alertas').then((r) => r.data);