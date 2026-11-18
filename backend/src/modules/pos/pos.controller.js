import { AppError } from '../../utils/AppError.js';
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

// GET /api/pos/productos?categoriaId=&buscar= -> 200 | 400
export async function getProductos(req, res, next) {
  try {
    const sucursalId = req.usuario.sucursalId;
    const { categoriaId } = req.query;
    const buscar = String(req.query.buscar ?? '').trim();

    if (categoriaId && (!Number.isInteger(Number(categoriaId)) || Number(categoriaId) <= 0)) {
      throw new AppError('El ID de la categoría no es válido', 400);
    }

    const productos = await posService.listarProductos({
      sucursalId,
      categoriaId: categoriaId ? Number(categoriaId) : undefined,
      buscar,
    });
    res.json({ ok: true, productos });
  } catch (error) {
    next(error);
  }
}