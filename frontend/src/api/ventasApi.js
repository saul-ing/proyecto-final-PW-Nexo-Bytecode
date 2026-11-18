import axios from 'axios';

const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL}/ventas` });

//token de autorizacion
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const getVentas = () => api.get('/').then((r) => r.data.ventas); //Historial
export const getVentaPorId = (id) => api.get(`/${id}`).then((r) => r.data.venta); //Detalle de venta por id
export const registrarVenta = (datos) => api.post('/', datos); //Registrar nueva venta