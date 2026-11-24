import { crearApi } from './axios';

const api = crearApi('/pos');
const apiVentas = crearApi('/ventas');

// Catálogo
export const getCategorias = () => api.get('/categorias').then((r) => r.data.categorias);
export const getProductosPos = (params) =>
  api.get('/productos', { params }).then((r) => r.data.productos);

// Clientes (CCF)
export const buscarClientes = (buscar) =>
  api.get('/clientes', { params: { buscar } }).then((r) => r.data.clientes);
export const crearCliente = (datos) => api.post('/clientes', datos).then((r) => r.data.cliente);

// datos = { tipoDocumento, clienteId, items: [{ productoId, cantidad }], pagos: [{ medio, monto, referencia }] }
export const registrarVenta = (datos) => apiVentas.post('', datos).then((r) => r.data.venta);