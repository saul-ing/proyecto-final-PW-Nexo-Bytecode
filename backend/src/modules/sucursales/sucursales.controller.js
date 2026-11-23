import * as sucursalesService from './sucursales.service.js';
import { AppError } from '../../utils/AppError.js';

const leerId = (req) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw new AppError('ID inválido', 400);
  return id;
};

// GET /api/sucursales -> 200
export async function getSucursales(req, res, next) {
  try {
    const sucursales = await sucursalesService.listarSucursales();
    res.json({ ok: true, sucursales });
  } catch (error) {
    next(error);
  }
}

// GET /api/sucursales/:id -> 200
export async function getSucursal(req, res) {
  const sucursal = await sucursalesService.obtenerSucursal(leerId(req));
  res.json({ ok: true, sucursal });
}

// POST /api/sucursales -> 201 (solo ADMIN)
export async function postSucursal(req, res) {
  const sucursal = await sucursalesService.crearSucursal(req.body);
  res.status(201).json({ ok: true, sucursal });
}

// PUT /api/sucursales/:id -> 200 (solo ADMIN)
export async function putSucursal(req, res) {
  const sucursal = await sucursalesService.actualizarSucursal(leerId(req), req.body);
  res.json({ ok: true, sucursal });
}