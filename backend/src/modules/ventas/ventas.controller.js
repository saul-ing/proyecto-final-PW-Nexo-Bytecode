import { AppError } from '../../utils/AppError.js';
import * as ventasService from './ventas.service.js';

// POST /api/ventas -> 201 | 400
export async function crearVenta(req, res, next) {
  try {
    const sucursalId = req.usuario.sucursalId;
    const usuarioId = req.usuario.id;
    const { tipoDocumento, clienteId, pagos, items } = req.body;

    if (!tipoDocumento || !['CF', 'CCF'].includes(tipoDocumento)) {
      throw new AppError('El tipo de documento debe ser CF o CCF', 400);
    }
    if (!Array.isArray(pagos) || pagos.length === 0) {
      throw new AppError('Debe especificar al menos un método de pago', 400);
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw new AppError('La venta debe incluir al menos un producto', 400);
    }
    if (clienteId !== undefined && clienteId !== null && (!Number.isInteger(Number(clienteId)) || Number(clienteId) <= 0)) {
      throw new AppError('El ID del cliente no es válido', 400);
    }

    const venta = await ventasService.registrarVenta({
      sucursalId,
      usuarioId,
      tipoDocumento,
      clienteId: clienteId ? Number(clienteId) : null,
      pagos,
      items,
    });

    res.status(201).json({ ok: true, venta });
  } catch (error) {
    next(error);
  }
}

// GET /api/ventas -> 200
export async function getVentas(req, res, next) {
  try {
    const sucursalId = req.usuario.sucursalId;
    const { turnoId, fecha } = req.query;

    if (turnoId && (!Number.isInteger(Number(turnoId)) || Number(turnoId) <= 0)) {
      throw new AppError('El ID del turno no es válido', 400);
    }
    if (fecha && !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      throw new AppError('El formato de fecha debe ser YYYY-MM-DD', 400);
    }

    const ventas = await ventasService.listarVentas({
      sucursalId,
      turnoId: turnoId ? Number(turnoId) : undefined,
      fecha,
    });

    res.json({ ok: true, ventas });
  } catch (error) {
    next(error);
  }
}

// GET /api/ventas/:id -> 200 | 400 | 404
export async function getVentaById(req, res, next) {
  try {
    const sucursalId = req.usuario.sucursalId;
    const ventaId = Number(req.params.id);

    if (!Number.isInteger(ventaId) || ventaId <= 0) {
      throw new AppError('El ID de la venta no es válido', 400);
    }

    const venta = await ventasService.obtenerVentaPorId(ventaId, sucursalId);
    res.json({ ok: true, venta });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/ventas/:id/anular -> 200 | 400 | 404
export async function anularVenta(req, res, next) {
  try {
    const sucursalId = req.usuario.sucursalId;
    const ventaId = Number(req.params.id);

    if (!Number.isInteger(ventaId) || ventaId <= 0) {
      throw new AppError('El ID de la venta no es válido', 400);
    }

    const ventaAnulada = await ventasService.anularVenta(ventaId, sucursalId);
    res.json({ ok: true, message: 'Venta anulada correctamente', venta: ventaAnulada });
  } catch (error) {
    next(error);
  }
}