import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';

// Sucursales activas, para selectores del frontend
export function listarSucursales() {
  return prisma.sucursal.findMany({
    where: { activa: true },
    select: { id: true, nombre: true, direccion: true, telefono: true },
    orderBy: { id: 'asc' },
  });
}

export async function obtenerSucursal(id) {
  const sucursal = await prisma.sucursal.findUnique({ where: { id } });
  if (!sucursal) throw new AppError('Sucursal no encontrada', 404);
  return sucursal;
}

export function crearSucursal({ nombre, direccion, telefono }) {
  if (!nombre) throw new AppError('El nombre es obligatorio', 400);
  return prisma.sucursal.create({ data: { nombre, direccion, telefono } });
}

export async function actualizarSucursal(id, { nombre, direccion, telefono, activa }) {
  await obtenerSucursal(id);
  return prisma.sucursal.update({
    where: { id },
    data: { nombre, direccion, telefono, activa },
  });
}