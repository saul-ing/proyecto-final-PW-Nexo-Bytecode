// empleados.controller.js
import * as svc from './empleados.service.js';
import { AppError } from '../../utils/AppError.js';

export const id = (req) => {
  const n = Number(req.params.id);
  if (!Number.isInteger(n)) throw new AppError('ID inválido', 400);
  return n;
};
// Un GERENTE solo ve su sucursal; ADMIN puede filtrar
export const alcance = (req, pedida) =>
  req.usuario.rol === 'GERENTE' ? req.usuario.sucursalId : (pedida ? Number(pedida) : undefined);

export const listar = async (req, res) => {
  const activo = req.query.activo === undefined ? undefined : req.query.activo === 'true';
  res.json({ ok: true, data: await svc.listarEmpleados({ sucursalId: alcance(req, req.query.sucursalId), activo }) });
};
export const obtener = async (req, res) => res.json({ ok: true, data: await svc.obtenerEmpleado(id(req)) });
export const crear = async (req, res) => res.status(201).json({ ok: true, data: await svc.crearEmpleado(req.body) });
export const actualizar = async (req, res) => res.json({ ok: true, data: await svc.actualizarEmpleado(id(req), req.body) });
export const desactivar = async (req, res) => res.json({ ok: true, data: await svc.desactivarEmpleado(id(req)) });