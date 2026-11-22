import * as sucursalesService from './sucursales.service.js';

// GET /api/sucursales -> 200
export async function getSucursales(req, res, next) {
  try {
    const sucursales = await sucursalesService.listarSucursales();
    res.json({ ok: true, sucursales });
  } catch (error) {
    next(error);
  }
}
