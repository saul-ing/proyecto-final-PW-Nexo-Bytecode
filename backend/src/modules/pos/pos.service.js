import { prisma } from '../../config/db.js';

// Categorías que tienen al menos un producto activo
export async function listarCategorias() {
  return prisma.categoria.findMany({
    where: { productos: { some: { activo: true } } },
    orderBy: { nombre: 'asc' },
  });
}

// Cuántas unidades del producto alcanzan con el stock de la sucursal.
// Es el insumo que se acaba primero: stock / lo que gasta una unidad.
function calcularDisponibles(producto, stockPorInsumo) {
  const lineas =
    producto.tipo === 'REVENTA'
      ? [{ insumoId: producto.insumoReventaId, cantidad: 1 }]
      : producto.receta;

  if (lineas.length === 0) return 0;

  const posibles = lineas.map((l) => (stockPorInsumo.get(l.insumoId) ?? 0) / Number(l.cantidad));
  return Math.floor(Math.min(...posibles));
}

export async function listarProductos({ sucursalId, categoriaId, buscar }) {
  const where = { activo: true };
  if (categoriaId) where.categoriaId = categoriaId;
  if (buscar) where.nombre = { contains: buscar, mode: 'insensitive' };

  const productos = await prisma.producto.findMany({
    where,
    include: { categoria: true, receta: true },
    orderBy: { nombre: 'asc' },
  });

  // Un solo query con el stock de todos los insumos que se usan
  const insumoIds = new Set();
  productos.forEach((p) => {
    if (p.insumoReventaId) insumoIds.add(p.insumoReventaId);
    p.receta.forEach((r) => insumoIds.add(r.insumoId));
  });

  const stocks = await prisma.stockSucursal.findMany({
    where: { sucursalId, insumoId: { in: [...insumoIds] } },
  });
  const stockPorInsumo = new Map(stocks.map((s) => [s.insumoId, Number(s.cantidad)]));

  // El POS no necesita la receta, solo lo que se muestra y se vende
  return productos.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    tipo: p.tipo,
    precio: Number(p.precio),
    categoriaId: p.categoriaId,
    categoria: p.categoria.nombre,
    disponibles: calcularDisponibles(p, stockPorInsumo),
  }));
}