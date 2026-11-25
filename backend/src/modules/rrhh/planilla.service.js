import { Prisma } from '@prisma/client';
import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';
import { calcularQuincena, calcularPatronal } from './nomina.calculo.js';

export async function generarPlanilla({ fechaInicio, fechaFin, sucursalId }) {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  if (isNaN(inicio) || isNaN(fin) || fin < inicio) {
    throw new AppError('Rango de fechas inválido', 400);
  }

  const duplicada = await prisma.planilla.findFirst({
    where: { tipo: 'QUINCENAL', fechaInicio: inicio, fechaFin: fin, sucursalId: sucursalId ?? null },
  });
  if (duplicada) throw new AppError('Ya existe una planilla para ese período', 409);

  const [empleados, tramos] = await Promise.all([
    prisma.empleado.findMany({
      where: { activo: true, fechaIngreso: { lte: fin }, ...(sucursalId && { sucursalId }) },
    }),
    prisma.tramoRenta.findMany({ orderBy: { desde: 'asc' } }),
  ]);
  if (tramos.length === 0) throw new AppError('No hay tramos de renta cargados (npm run db:seed)', 422);
  if (empleados.length === 0) throw new AppError('No hay empleados activos para esa planilla', 422);

  const detalles = empleados.map((e) => ({
    empleadoId: e.id,
    ...calcularQuincena(e.salarioMensual, tramos),
  }));

  // El create anidado es atómico: o se guarda todo o nada
  return prisma.planilla.create({
    data: {
      tipo: 'QUINCENAL',
      fechaInicio: inicio,
      fechaFin: fin,
      sucursalId: sucursalId ?? null,
      detalles: { create: detalles },
    },
    include: { detalles: true },
  });
}

export function listarPlanillas({ sucursalId } = {}) {
  return prisma.planilla.findMany({
    where: sucursalId ? { OR: [{ sucursalId }, { sucursalId: null }] } : {},
    orderBy: { fechaInicio: 'desc' },
  });
}

export async function obtenerPlanilla(id) {
  const planilla = await prisma.planilla.findUnique({
    where: { id },
    include: {
      detalles: { include: { empleado: { select: { nombre: true, cargo: true, dui: true } } } },
    },
  });
  if (!planilla) throw new AppError('Planilla no encontrada', 404);

  const zero = new Prisma.Decimal(0);
  const sum = (fn) => planilla.detalles.reduce((a, d) => a.plus(fn(d)), zero);
  const totales = {
    salarioBruto: sum((d) => d.salarioBruto),
    isss: sum((d) => d.isss),
    afp: sum((d) => d.afp),
    renta: sum((d) => d.renta),
    otrasDeducciones: sum((d) => d.otrasDeducciones),
    salarioNeto: sum((d) => d.salarioNeto),
    isssPatronal: sum((d) => calcularPatronal(d.salarioBruto).isssPatronal),
    afpPatronal: sum((d) => calcularPatronal(d.salarioBruto).afpPatronal),
  };
  return { ...planilla, totales };
}

export async function marcarPagada(id) {
  const planilla = await prisma.planilla.findUnique({ where: { id } });
  if (!planilla) throw new AppError('Planilla no encontrada', 404);
  if (planilla.estado !== 'BORRADOR') throw new AppError('La planilla ya no está en borrador', 409);
  // El enum EstadoPlanilla solo tiene BORRADOR y APROBADA; APROBADA es la planilla ya pagada
  return prisma.planilla.update({ where: { id }, data: { estado: 'APROBADA' } });
}