import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';

// Turno ABIERTO de un usuario (o null si no tiene)
export async function obtenerTurnoAbierto(db, usuarioId) {
  return db.turno.findFirst({ where: { usuarioId, estado: 'ABIERTO' } });
}

// Devuelve el turno para guardar venta.turnoId, o lanza error si no hay turno abierto.
export async function exigirTurnoAbierto(db, usuarioId) {
  const turno = await obtenerTurnoAbierto(db, usuarioId);
  if (!turno) throw new AppError('Debes abrir turno antes de vender', 409);
  return turno;
}

export async function abrirTurno({ id: usuarioId, sucursalId }, montoInicial) {
  if (!sucursalId) throw new AppError('Tu usuario no tiene sucursal asignada', 400);

  const monto = Number(montoInicial);
  if (!Number.isFinite(monto) || monto < 0) {
    throw new AppError('El monto inicial debe ser un número mayor o igual a 0', 400);
  }

  if (await obtenerTurnoAbierto(prisma, usuarioId)) {
    throw new AppError('Ya tienes un turno abierto', 409);
  }

  return prisma.turno.create({
    data: { montoInicial: monto, usuarioId, sucursalId },
  });
}

export async function turnoActual(usuarioId) {
  return obtenerTurnoAbierto(prisma, usuarioId);
}