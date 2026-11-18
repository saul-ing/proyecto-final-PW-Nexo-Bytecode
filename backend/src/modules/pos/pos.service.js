import { prisma } from '../../config/db.js';

// Categorías que tienen al menos un producto activo
export async function listarCategorias() {
  return prisma.categoria.findMany({
    where: { productos: { some: { activo: true } } },
    orderBy: { nombre: 'asc' },
  });
}