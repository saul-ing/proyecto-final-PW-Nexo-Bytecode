import { crearApi } from './axios';

const api = crearApi('/ventas');

export const getVentas = () => api.get('/').then((r) => r.data.ventas); //Historial
export const getVentaPorId = (id) => api.get(`/${id}`).then((r) => r.data.venta); //Detalle de venta por id
export const registrarVenta = (datos) => api.post('/', datos); //Registrar nueva venta