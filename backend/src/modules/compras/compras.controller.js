import * as comprasService from './compras.service.js';
import { AppError } from '../../utils/AppError.js';

// La sucursal sale del token del usuario
function sucursalDe(req) {
  if (!req.usuario.sucursalId) throw new AppError('El usuario no tiene sucursal asignada');
  return req.usuario.sucursalId;
}

// ---------- PROVEEDORES ----------

// GET /api/compras/proveedores -> 200
export async function getProveedores(req, res, next) {
  try {
    const proveedores = await comprasService.listarProveedores();
    res.json({ ok: true, proveedores });
  } catch (error) {
    next(error);
  }
}

// POST /api/compras/proveedores -> 201 | 400 | 409
export async function crearProveedor(req, res, next) {
  try {
    const proveedor = await comprasService.crearProveedor(req.body);
    res.status(201).json({ ok: true, proveedor });
  } catch (error) {
    next(error);
  }
}

// PUT /api/compras/proveedores/:id -> 200 | 400 | 404 | 409
export async function editarProveedor(req, res, next) {
  try {
    const proveedor = await comprasService.editarProveedor(Number(req.params.id), req.body);
    res.json({ ok: true, proveedor });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/compras/proveedores/:id -> 200 | 404
export async function eliminarProveedor(req, res, next) {
  try {
    await comprasService.desactivarProveedor(Number(req.params.id));
    res.json({ ok: true, message: 'Proveedor desactivado' });
  } catch (error) {
    next(error);
  }
}

// GET /api/compras/proveedores/:id/estado-cuenta -> 200 | 404
export async function getEstadoCuenta(req, res, next) {
  try {
    const estado = await comprasService.estadoCuentaProveedor(Number(req.params.id), sucursalDe(req));
    res.json({ ok: true, ...estado });
  } catch (error) {
    next(error);
  }
}

// ---------- COMPRAS ----------

// GET /api/compras -> 200
export async function getCompras(req, res, next) {
  try {
    const compras = await comprasService.listarCompras(sucursalDe(req));
    res.json({ ok: true, compras });
  } catch (error) {
    next(error);
  }
}

// GET /api/compras/:id -> 200 | 404
export async function getCompra(req, res, next) {
  try {
    const compra = await comprasService.obtenerCompra(Number(req.params.id), sucursalDe(req));
    res.json({ ok: true, compra });
  } catch (error) {
    next(error);
  }
}

// POST /api/compras -> 201 | 400 | 404 | 409 (factura repetida)
export async function crearCompra(req, res, next) {
  try {
    const compra = await comprasService.registrarCompra(sucursalDe(req), req.body);
    res.status(201).json({ ok: true, compra });
  } catch (error) {
    next(error);
  }
}

// ---------- CUENTAS POR PAGAR ----------

// GET /api/compras/cuentas?estado=PENDIENTE -> 200 | 400
export async function getCuentas(req, res, next) {
  try {
    const { estado } = req.query;
    if (estado && !['PENDIENTE', 'PARCIAL', 'PAGADA'].includes(estado)) {
      throw new AppError('Estado no válido');
    }
    const cuentas = await comprasService.listarCuentas(sucursalDe(req), estado);
    res.json({ ok: true, cuentas });
  } catch (error) {
    next(error);
  }
}

// POST /api/compras/cuentas/:id/abonos -> 201 | 400 | 404 | 409
export async function crearAbono(req, res, next) {
  try {
    const cuenta = await comprasService.registrarAbono(
      sucursalDe(req),
      req.usuario.id,
      Number(req.params.id),
      req.body,
    );
    res.status(201).json({ ok: true, cuenta });
  } catch (error) {
    next(error);
  }
}
