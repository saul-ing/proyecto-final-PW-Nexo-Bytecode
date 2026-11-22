import { prisma } from '../../config/db.js';

// Sucursales activas, para selectores del frontend
export function listarSucursales() {
  return prisma.sucursal.findMany({
    where: { activa: true },
    select: { id: true, nombre: true, direccion: true, telefono: true },
    orderBy: { id: 'asc' },
  });
}
