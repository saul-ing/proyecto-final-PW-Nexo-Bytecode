import axios from 'axios';

const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL}/rrhh` });

// El backend pide token, se manda en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Empleados. datos = { nombre, dui, nit, numeroIsss, numeroAfp, cargo, salarioMensual, fechaIngreso, sucursalId }
// params opcionales: { activo: true, sucursalId }
export const getEmpleados = (params) => api.get('/empleados', { params }).then((r) => r.data.data);
export const crearEmpleado = (datos) => api.post('/empleados', datos).then((r) => r.data.data);
export const editarEmpleado = (id, datos) => api.put(`/empleados/${id}`, datos).then((r) => r.data.data);
export const desactivarEmpleado = (id) => api.patch(`/empleados/${id}/desactivar`).then((r) => r.data.data);

// Planillas. datos = { fechaInicio, fechaFin, sucursalId? }
export const getPlanillas = () => api.get('/planillas').then((r) => r.data.data);
// Devuelve la planilla con sus detalles (por empleado) y totales
export const getPlanilla = (id) => api.get(`/planillas/${id}`).then((r) => r.data.data);
export const generarPlanilla = (datos) => api.post('/planillas/generar', datos).then((r) => r.data.data);
export const pagarPlanilla = (id) => api.patch(`/planillas/${id}/pagar`).then((r) => r.data.data);