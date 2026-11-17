import axios from 'axios';

const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL}/compras` });

// El backend pide token, se manda en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Proveedores
export const getProveedores = () => api.get('/proveedores').then((r) => r.data.proveedores);
export const crearProveedor = (datos) => api.post('/proveedores', datos).then((r) => r.data.proveedor);
export const editarProveedor = (id, datos) => api.put(`/proveedores/${id}`, datos).then((r) => r.data.proveedor);
export const eliminarProveedor = (id) => api.delete(`/proveedores/${id}`);

// Compras. datos = { proveedorId, numeroDocumento, fecha, condicion, detalles: [{ insumoId, cantidad, costoUnitario }] }
export const getCompras = () => api.get('/').then((r) => r.data.compras);
export const getCompra = (id) => api.get(`/${id}`).then((r) => r.data.compra);
export const crearCompra = (datos) => api.post('/', datos).then((r) => r.data.compra);

// Cuentas por pagar. estado opcional: PENDIENTE, PARCIAL o PAGADA
export const getCuentas = (estado) => api.get('/cuentas', { params: { estado } }).then((r) => r.data.cuentas);
export const crearAbono = (id, datos) => api.post(`/cuentas/${id}/abonos`, datos).then((r) => r.data.cuenta);
