// Cambio: Saúl exporta prisma desde config/db.js
import { prisma } from '../../config/db.js';
// Cambio: errores con AppError en vez de res.status(400)
import { AppError } from '../../utils/AppError.js';

// ---------- INSUMOS ----------
// El stock es por sucursal (tabla StockSucursal). La sucursal sale del token del usuario.

// GET /api/inventario/insumos -> 200
export async function getInsumos(req, res, next) {
  try {
    // Cambio: la sucursal viene del token
    const sucursalId = req.usuario.sucursalId;
    const insumos = await prisma.insumo.findMany({
      where: { activo: true },
      // Cambio: el stock está en la tabla StockSucursal
      include: { stocks: { where: { sucursalId } } },
      orderBy: { nombre: 'asc' },
    });

    // Se aplana el stock de la sucursal para que el frontend lo use fácil
    const lista = insumos.map((i) => ({
      id: i.id,
      nombre: i.nombre,
      unidad: i.unidad,
      costoUnitario: i.costoUnitario,
      cantidad: i.stocks[0]?.cantidad ?? 0,
      stockMinimo: i.stocks[0]?.stockMinimo ?? 0,
    }));
    // Cambio: formato de respuesta de Saúl { ok, ... }
    res.json({ ok: true, insumos: lista });
  } catch (error) {
    next(error);
  }
}

// POST /api/inventario/insumos -> 201 | 400
// body: { nombre, unidad, costoUnitario, cantidad, stockMinimo }
export async function crearInsumo(req, res, next) {
  try {
    const sucursalId = req.usuario.sucursalId;
    const { nombre, unidad, costoUnitario = 0, cantidad = 0, stockMinimo = 0 } = req.body;
    if (!nombre || !unidad) throw new AppError('Nombre y unidad son obligatorios', 400);

    // Cambio: insumo + stock + kardex en una transacción
    const insumo = await prisma.$transaction(async (tx) => {
      const nuevo = await tx.insumo.create({
        data: {
          nombre,
          unidad,
          costoUnitario: Number(costoUnitario),
          // Cambio: el stock inicial se crea en StockSucursal
          stocks: { create: { sucursalId, cantidad: Number(cantidad), stockMinimo: Number(stockMinimo) } },
        },
      });

      // Kardex: el stock inicial queda registrado como AJUSTE
      if (Number(cantidad) > 0) {
        await tx.movimientoInventario.create({
          data: { tipo: 'AJUSTE', cantidad: Number(cantidad), referencia: 'STOCK_INICIAL', insumoId: nuevo.id, sucursalId },
        });
      }
      return nuevo;
    });

    res.status(201).json({ ok: true, insumo });
  } catch (error) {
    next(error);
  }
}

// PUT /api/inventario/insumos/:id -> 200
// Edita datos y stock mínimo. La cantidad solo cambia con compras y ventas.
export async function editarInsumo(req, res, next) {
  try {
    const sucursalId = req.usuario.sucursalId;
    const insumoId = Number(req.params.id);
    const { nombre, unidad, costoUnitario, stockMinimo } = req.body;

    const insumo = await prisma.insumo.update({
      where: { id: insumoId },
      data: { nombre, unidad, costoUnitario: Number(costoUnitario) },
    });

    // Cambio: el stock mínimo se guarda en StockSucursal
    await prisma.stockSucursal.upsert({
      where: { insumoId_sucursalId: { insumoId, sucursalId } },
      create: { insumoId, sucursalId, stockMinimo: Number(stockMinimo) },
      update: { stockMinimo: Number(stockMinimo) },
    });

    res.json({ ok: true, insumo });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/inventario/insumos/:id -> 200 (se desactiva, no se borra)
export async function eliminarInsumo(req, res, next) {
  try {
    await prisma.insumo.update({ where: { id: Number(req.params.id) }, data: { activo: false } });
    res.json({ ok: true, message: 'Insumo eliminado' });
  } catch (error) {
    next(error);
  }
}

// ---------- PRODUCTOS ----------

// Cambio: se incluyen categoría e insumo de reventa (relaciones nuevas)
const incluirProducto = { categoria: true, insumoReventa: true, receta: { include: { insumo: true } } };

// Arma los datos del producto. La categoría se escribe como texto:
// si ya existe se usa, si no se crea (connectOrCreate).
function datosProducto(body, editando = false) {
  const { nombre, tipo, precio, categoria, insumoReventaId } = body;
  if (!nombre || !tipo || !precio || !categoria) {
    throw new AppError('Nombre, tipo, precio y categoría son obligatorios', 400);
  }
  if (tipo === 'REVENTA' && !insumoReventaId) {
    throw new AppError('Un producto de reventa necesita su insumo', 400);
  }

  const data = {
    nombre,
    tipo,
    precio: Number(precio),
    // Cambio: categoría es tabla aparte; se busca por nombre o se crea
    categoria: { connectOrCreate: { where: { nombre: categoria }, create: { nombre: categoria } } },
  };

  // Solo REVENTA se enlaza a un insumo. Si al editar pasa a ELABORADO, se quita el enlace.
  if (tipo === 'REVENTA') data.insumoReventa = { connect: { id: Number(insumoReventaId) } };
  else if (editando) data.insumoReventa = { disconnect: true };

  return data;
}

// GET /api/inventario/productos -> 200
export async function getProductos(req, res, next) {
  try {
    const productos = await prisma.producto.findMany({
      where: { activo: true },
      include: incluirProducto,
      orderBy: { nombre: 'asc' },
    });
    res.json({ ok: true, productos });
  } catch (error) {
    next(error);
  }
}

// GET /api/inventario/productos/:id -> 200 | 404
export async function getProducto(req, res, next) {
  try {
    const producto = await prisma.producto.findUnique({
      where: { id: Number(req.params.id) },
      include: incluirProducto,
    });
    if (!producto) throw new AppError('Producto no encontrado', 404);
    res.json({ ok: true, producto });
  } catch (error) {
    next(error);
  }
}

// POST /api/inventario/productos -> 201 | 400
// body: { nombre, tipo, precio, categoria, insumoReventaId? }
export async function crearProducto(req, res, next) {
  try {
    const producto = await prisma.producto.create({ data: datosProducto(req.body) });
    res.status(201).json({ ok: true, producto });
  } catch (error) {
    next(error);
  }
}

// PUT /api/inventario/productos/:id -> 200
export async function editarProducto(req, res, next) {
  try {
    const producto = await prisma.producto.update({
      where: { id: Number(req.params.id) },
      data: datosProducto(req.body, true),
    });
    res.json({ ok: true, producto });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/inventario/productos/:id -> 200 (se desactiva)
export async function eliminarProducto(req, res, next) {
  try {
    await prisma.producto.update({ where: { id: Number(req.params.id) }, data: { activo: false } });
    res.json({ ok: true, message: 'Producto eliminado' });
  } catch (error) {
    next(error);
  }
}

// ---------- RECETAS ----------

// PUT /api/inventario/productos/:id/receta -> 200 | 400
// body: { lineas: [{ insumoId, cantidad }] }
// Borra la receta vieja y guarda la nueva en una transacción.
export async function guardarReceta(req, res, next) {
  try {
    const productoId = Number(req.params.id);
    const { lineas } = req.body;
    if (!Array.isArray(lineas) || lineas.length === 0) {
      throw new AppError('La receta necesita al menos un insumo', 400);
    }

    await prisma.$transaction([
      // Cambio: la tabla se llama RecetaItem
      prisma.recetaItem.deleteMany({ where: { productoId } }),
      prisma.recetaItem.createMany({
        data: lineas.map((l) => ({ productoId, insumoId: Number(l.insumoId), cantidad: Number(l.cantidad) })),
      }),
    ]);
    res.json({ ok: true, message: 'Receta guardada' });
  } catch (error) {
    next(error);
  }
}

// ---------- ALERTAS ----------

// GET /api/inventario/alertas -> 200
// Insumos de la sucursal con cantidad <= stock mínimo.
export async function getAlertas(req, res, next) {
  try {
    // Cambio: las alertas salen de StockSucursal de la sucursal del usuario
    const stocks = await prisma.stockSucursal.findMany({
      where: { sucursalId: req.usuario.sucursalId, insumo: { activo: true } },
      include: { insumo: true },
    });

    const alertas = stocks.filter((s) => Number(s.cantidad) <= Number(s.stockMinimo));
    res.json({ ok: true, alertas });
  } catch (error) {
    next(error);
  }
}