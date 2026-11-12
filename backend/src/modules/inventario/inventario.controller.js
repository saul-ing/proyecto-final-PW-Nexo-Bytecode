import prisma from '../../config/prisma.js';

// ---------- INSUMOS ----------

// GET /api/inventario/insumos -> 200
export async function getInsumos(req, res, next) {
  try {
    const insumos = await prisma.insumo.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } });
    res.status(200).json(insumos);
  } catch (error) {
    next(error);
  }
}

// POST /api/inventario/insumos -> 201 | 400
export async function crearInsumo(req, res, next) {
  try {
    const { nombre, unidad, stockActual, stockMinimo } = req.body;
    if (!nombre || !unidad) return res.status(400).json({ message: 'Nombre y unidad son obligatorios' });

    const insumo = await prisma.insumo.create({
      data: { nombre, unidad, stockActual: Number(stockActual), stockMinimo: Number(stockMinimo) },
    });
    res.status(201).json(insumo);
  } catch (error) {
    next(error);
  }
}

// PUT /api/inventario/insumos/:id -> 200
export async function editarInsumo(req, res, next) {
  try {
    const { nombre, unidad, stockActual, stockMinimo } = req.body;
    const insumo = await prisma.insumo.update({
      where: { id: Number(req.params.id) },
      data: { nombre, unidad, stockActual: Number(stockActual), stockMinimo: Number(stockMinimo) },
    });
    res.status(200).json(insumo);
  } catch (error) {
    next(error);
  }
}

// DELETE /api/inventario/insumos/:id -> 200 (se desactiva, no se borra)
export async function eliminarInsumo(req, res, next) {
  try {
    await prisma.insumo.update({ where: { id: Number(req.params.id) }, data: { activo: false } });
    res.status(200).json({ message: 'Insumo eliminado' });
  } catch (error) {
    next(error);
  }
}

// ---------- PRODUCTOS ----------

// GET /api/inventario/productos -> 200 (incluye la receta)
export async function getProductos(req, res, next) {
  try {
    const productos = await prisma.producto.findMany({
      where: { activo: true },
      include: { receta: { include: { insumo: true } } },
      orderBy: { nombre: 'asc' },
    });
    res.status(200).json(productos);
  } catch (error) {
    next(error);
  }
}

// GET /api/inventario/productos/:id -> 200 | 404
export async function getProducto(req, res, next) {
  try {
    const producto = await prisma.producto.findUnique({
      where: { id: Number(req.params.id) },
      include: { receta: { include: { insumo: true } } },
    });
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
    res.status(200).json(producto);
  } catch (error) {
    next(error);
  }
}

// POST /api/inventario/productos -> 201 | 400
export async function crearProducto(req, res, next) {
  try {
    const { nombre, categoria, precio, tipo, stockActual = 0, stockMinimo = 0 } = req.body;
    if (!nombre || !categoria || !precio || !tipo) {
      return res.status(400).json({ message: 'Nombre, categoría, precio y tipo son obligatorios' });
    }

    const producto = await prisma.producto.create({
      data: { nombre, categoria, precio: Number(precio), tipo, stockActual: Number(stockActual), stockMinimo: Number(stockMinimo) },
    });
    res.status(201).json(producto);
  } catch (error) {
    next(error);
  }
}

// PUT /api/inventario/productos/:id -> 200
export async function editarProducto(req, res, next) {
  try {
    const { nombre, categoria, precio, tipo, stockActual = 0, stockMinimo = 0 } = req.body;
    const producto = await prisma.producto.update({
      where: { id: Number(req.params.id) },
      data: { nombre, categoria, precio: Number(precio), tipo, stockActual: Number(stockActual), stockMinimo: Number(stockMinimo) },
    });
    res.status(200).json(producto);
  } catch (error) {
    next(error);
  }
}

// DELETE /api/inventario/productos/:id -> 200 (se desactiva)
export async function eliminarProducto(req, res, next) {
  try {
    await prisma.producto.update({ where: { id: Number(req.params.id) }, data: { activo: false } });
    res.status(200).json({ message: 'Producto eliminado' });
  } catch (error) {
    next(error);
  }
}

// ---------- RECETAS ----------

// PUT /api/inventario/productos/:id/receta   body: { lineas: [{ insumoId, cantidad }] } -> 200 | 400
// Borra la receta vieja y guarda la nueva en una transacción.
export async function guardarReceta(req, res, next) {
  try {
    const productoId = Number(req.params.id);
    const { lineas } = req.body;
    if (!Array.isArray(lineas) || lineas.length === 0) {
      return res.status(400).json({ message: 'La receta necesita al menos un insumo' });
    }

    await prisma.$transaction([
      prisma.recetaDetalle.deleteMany({ where: { productoId } }),
      prisma.recetaDetalle.createMany({
        data: lineas.map((l) => ({ productoId, insumoId: Number(l.insumoId), cantidad: Number(l.cantidad) })),
      }),
    ]);
    res.status(200).json({ message: 'Receta guardada' });
  } catch (error) {
    next(error);
  }
}

// ---------- ALERTAS ----------

// GET /api/inventario/alertas -> 200
// Insumos y productos de reventa con stock actual <= stock mínimo.
export async function getAlertas(req, res, next) {
  try {
    const insumos = await prisma.insumo.findMany({ where: { activo: true } });
    const productos = await prisma.producto.findMany({ where: { activo: true, tipo: 'REVENTA' } });

    const alertas = [...insumos, ...productos].filter((r) => Number(r.stockActual) <= Number(r.stockMinimo));
    res.status(200).json(alertas);
  } catch (error) {
    next(error);
  }
}