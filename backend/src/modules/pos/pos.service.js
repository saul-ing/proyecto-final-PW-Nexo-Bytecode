import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';

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

// Para el CCF: se busca por nombre o por NIT
export async function buscarClientes(buscar) {
  if (!buscar) return [];

  return prisma.cliente.findMany({
    where: {
      OR: [
        { nombre: { contains: buscar, mode: 'insensitive' } },
        { nit: { contains: buscar } },
      ],
    },
    orderBy: { nombre: 'asc' },
    take: 10,
  });
}

export async function crearCliente(datos) {
  // Quita espacios al inicio y al final; un campo con solo espacios queda vacío
  const limpio = (v) => (typeof v === 'string' ? v.trim() : v) || null;
  const [nombre, nit, nrc] = [limpio(datos.nombre), limpio(datos.nit), limpio(datos.nrc)];
  if (!nombre || !nit || !nrc) {
    throw new AppError('Nombre, NIT y NRC son obligatorios para un CCF', 400);
  }

  return prisma.cliente.create({
    data: {
      nombre, nit, nrc,
      giro: limpio(datos.giro),
      direccion: limpio(datos.direccion),
      telefono: limpio(datos.telefono),
      email: limpio(datos.email),
    },
  });
}