import axios from 'axios';

const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL}/pos` });
const apiVentas = axios.create({ baseURL: `${import.meta.env.VITE_API_URL}/ventas` });

// El backend pide token, se manda en cada petición
const conToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};
api.interceptors.request.use(conToken);
apiVentas.interceptors.request.use(conToken);

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