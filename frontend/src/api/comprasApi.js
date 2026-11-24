import { crearApi } from './axios';

const api = crearApi('/compras');

// Proveedores
export const getProveedores = () => api.get('/proveedores').then((r) => r.data.proveedores);
export const crearProveedor = (datos) => api.post('/proveedores', datos).then((r) => r.data.proveedor);
export const editarProveedor = (id, datos) => api.put(`/proveedores/${id}`, datos).then((r) => r.data.proveedor);
export const eliminarProveedor = (id) => api.delete(`/proveedores/${id}`);
// Devuelve { proveedor, compras, resumen }
export const getEstadoCuenta = (id) => api.get(`/proveedores/${id}/estado-cuenta`).then((r) => r.data);

// Compras. datos = { proveedorId, numeroDocumento, fecha, condicion, detalles: [{ insumoId, cantidad, costoUnitario }] }
export const getCompras = () => api.get('/').then((r) => r.data.compras);
export const getCompra = (id) => api.get(`/${id}`).then((r) => r.data.compra);
export const crearCompra = (datos) => api.post('/', datos).then((r) => r.data.compra);

// Cuentas por pagar. estado opcional: PENDIENTE, PARCIAL o PAGADA
export const getCuentas = (estado) => api.get('/cuentas', { params: { estado } }).then((r) => r.data.cuentas);
export const crearAbono = (id, datos) => api.post(`/cuentas/${id}/abonos`, datos).then((r) => r.data.cuenta);
