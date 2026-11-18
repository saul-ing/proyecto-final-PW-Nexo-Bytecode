import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/AppError.js';

const CAMPOS = ['nombre', 'dui', 'nit', 'numeroIsss', 'numeroAfp', 'cargo', 'salarioMensual', 'fechaIngreso', 'sucursalId'];
const pick = (obj) => Object.fromEntries(CAMPOS.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));

function validar(d, parcial = false) {
  const req = ['nombre', 'dui', 'cargo', 'salarioMensual', 'fechaIngreso', 'sucursalId'];
  if (!parcial) {
    for (const k of req) if (d[k] === undefined || d[k] === '') throw new AppError(`Falta el campo ${k}`, 400);
  }
  if (d.salarioMensual !== undefined && !(Number(d.salarioMensual) > 0)) {
    throw new AppError('El salario debe ser mayor a 0', 400);
  }
  if (d.fechaIngreso !== undefined) {
    d.fechaIngreso = new Date(d.fechaIngreso);
    if (isNaN(d.fechaIngreso)) throw new AppError('Fecha de ingreso inválida', 400);
  }
}

export function listarEmpleados({ sucursalId, activo } = {}) {
  return prisma.empleado.findMany({
    where: { ...(sucursalId && { sucursalId }), ...(activo !== undefined && { activo }) },
    include: { sucursal: { select: { id: true, nombre: true } } },
    orderBy: { nombre: 'asc' },
  });
}

export async function obtenerEmpleado(id) {
  const e = await prisma.empleado.findUnique({ where: { id }, include: { sucursal: true } });
  if (!e) throw new AppError('Empleado no encontrado', 404);
  return e;
}

export function crearEmpleado(body) {
  validar(body);
  return prisma.empleado.create({ data: pick(body) }); // DUI repetido → P2002 → 409
}

export function actualizarEmpleado(id, body) {
  validar(body, true);
  return prisma.empleado.update({ where: { id }, data: pick(body) });
}

// No se borra: las planillas viejas dependen del empleado
export function desactivarEmpleado(id) {
  return prisma.empleado.update({ where: { id }, data: { activo: false } });
}