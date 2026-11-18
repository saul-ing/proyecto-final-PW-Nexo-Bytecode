import * as posService from './pos.service.js';

// GET /api/pos/categorias -> 200
export async function getCategorias(req, res, next) {
  try {
    const categorias = await posService.listarCategorias();
    res.json({ ok: true, categorias });
  } catch (error) {
    next(error);
  }
}