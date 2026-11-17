import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';

// ---------- PROVEEDORES ----------

// Convierte "" en null para no chocar con el @unique del NIT
const vacioANull = (valor) => (valor === undefined || valor === '' ? null : valor);

function validarProveedor(datos) {
  const nombre = (datos.nombre || '').trim();
  const diasCredito = Number(datos.diasCredito ?? 0);

  if (!nombre) throw new AppError('El nombre del proveedor es obligatorio');
  if (!Number.isInteger(diasCredito) || diasCredito < 0) {
    throw new AppError('Los días de crédito deben ser un número entero mayor o igual a 0');
  }

  return {
    nombre,
    nit: vacioANull(datos.nit),
    nrc: vacioANull(datos.nrc),
    telefono: vacioANull(datos.telefono),
    email: vacioANull(datos.email),
    diasCredito,
  };
}

export function listarProveedores() {
  return prisma.proveedor.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } });
}

export function crearProveedor(datos) {
  return prisma.proveedor.create({ data: validarProveedor(datos) });
}

export function editarProveedor(id, datos) {
  return prisma.proveedor.update({ where: { id }, data: validarProveedor(datos) });
}

// Borrado lógico: el proveedor tiene compras que no se pueden perder
export function desactivarProveedor(id) {
  return prisma.proveedor.update({ where: { id }, data: { activo: false } });
}
