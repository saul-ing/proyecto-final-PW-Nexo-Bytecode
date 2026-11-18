import * as svc from './planilla.service.js';
import { id, alcance } from './empleados.controller.js';

export const generar = async (req, res) => {
  const { fechaInicio, fechaFin, sucursalId } = req.body;
  const data = await svc.generarPlanilla({ fechaInicio, fechaFin, sucursalId: alcance(req, sucursalId) });
  res.status(201).json({ ok: true, data });
};
export const listar = async (req, res) =>
  res.json({ ok: true, data: await svc.listarPlanillas({ sucursalId: alcance(req, req.query.sucursalId) }) });
export const detalle = async (req, res) => res.json({ ok: true, data: await svc.obtenerPlanilla(id(req)) });
export const pagar = async (req, res) => res.json({ ok: true, data: await svc.marcarPagada(id(req)) });