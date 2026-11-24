import { crearApi } from './axios';

const api = crearApi('/caja');

// Devuelve el turno abierto o null si no hay
export const getTurnoActual = () => api.get('/turnos/actual').then((r) => r.data.turno);

export const abrirTurno = (montoInicial) =>
  api.post('/turnos/abrir', { montoInicial }).then((r) => r.data.turno);

// datos = { contadoEfectivo, contadoTarjeta, contadoDigital, observaciones }
// Devuelve { turno, diferencias }
export const cerrarTurno = (datos) =>
  api.post('/turnos/cerrar', datos).then((r) => ({ turno: r.data.turno, diferencias: r.data.diferencias }));