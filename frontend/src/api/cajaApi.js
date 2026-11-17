import axios from 'axios';

const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL}/caja` });

// El backend pide token, se manda en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Devuelve el turno abierto o null si no hay
export const getTurnoActual = () => api.get('/turnos/actual').then((r) => r.data.turno);

export const abrirTurno = (montoInicial) =>
  api.post('/turnos/abrir', { montoInicial }).then((r) => r.data.turno);

// datos = { contadoEfectivo, contadoTarjeta, contadoDigital, observaciones }
// Devuelve { turno, diferencias }
export const cerrarTurno = (datos) =>
  api.post('/turnos/cerrar', datos).then((r) => ({ turno: r.data.turno, diferencias: r.data.diferencias }));