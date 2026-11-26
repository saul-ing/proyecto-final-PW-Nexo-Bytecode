import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';

// Redondea a 2 decimales
const redondear = (n) => Math.round(Number(n) * 100) / 100;

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

  // El candado de PostgreSQL hace que dos aperturas del mismo usuario (ej. doble clic)
  // se atiendan una por una: la segunda ya ve el turno abierto y se rechaza.
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${usuarioId})`;

    if (await obtenerTurnoAbierto(tx, usuarioId)) {
      throw new AppError('Ya tienes un turno abierto', 409);
    }

    return tx.turno.create({
      data: { montoInicial: monto, usuarioId, sucursalId },
    });
  });
}

export async function turnoActual(usuarioId) {
  return obtenerTurnoAbierto(prisma, usuarioId);
}

// Suma los pagos de las ventas EMITIDAS del turno, agrupados por medio de pago
async function totalesDelTurno(tx, turnoId) {
  const pagos = await tx.pago.findMany({
    where: { venta: { turnoId, estado: 'EMITIDA' } },
    select: { medio: true, monto: true },
  });

  const t = { EFECTIVO: 0, TARJETA: 0, DIGITAL: 0 };
  for (const p of pagos) {
    const clave = p.medio === 'BITCOIN' || p.medio === 'CHIVO_WALLET' ? 'DIGITAL' : p.medio;
    t[clave] += Number(p.monto);
  }
  return t;
}

// contado = { contadoEfectivo, contadoTarjeta, contadoDigital, observaciones }
export async function cerrarTurno(usuarioId, contado) {
  const efectivo = Number(contado.contadoEfectivo);
  const tarjeta = Number(contado.contadoTarjeta);
  const digital = Number(contado.contadoDigital);
  if ([efectivo, tarjeta, digital].some((n) => !Number.isFinite(n) || n < 0)) {
    throw new AppError('Los montos contados deben ser números mayores o iguales a 0', 400);
  }

  return prisma.$transaction(async (tx) => {
    const turno = await obtenerTurnoAbierto(tx, usuarioId);
    if (!turno) throw new AppError('No tienes un turno abierto', 404);

    const t = await totalesDelTurno(tx, turno.id);
    const esperadoEfectivo = redondear(Number(turno.montoInicial) + t.EFECTIVO); // fondo + ventas en efectivo
    const esperadoTarjeta = redondear(t.TARJETA);
    const esperadoDigital = redondear(t.DIGITAL);

    const cerrado = await tx.turno.update({
      where: { id: turno.id },
      data: {
        estado: 'CERRADO',
        fechaCierre: new Date(),
        esperadoEfectivo,
        esperadoTarjeta,
        esperadoDigital,
        contadoEfectivo: efectivo,
        contadoTarjeta: tarjeta,
        contadoDigital: digital,
        observaciones: contado.observaciones || null,
      },
    });

    // diferencia = contado - esperado (negativo = faltante, positivo = sobrante)
    const diferencias = {
      efectivo: redondear(efectivo - esperadoEfectivo),
      tarjeta: redondear(tarjeta - esperadoTarjeta),
      digital: redondear(digital - esperadoDigital),
    };
    return { turno: cerrado, diferencias };
  });
}