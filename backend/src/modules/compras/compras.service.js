import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';
import { sumarStock } from '../inventario/inventario.service.js';

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

// ---------- COMPRAS ----------

const IVA = 0.13;
const redondear = (n) => Math.round(n * 100) / 100;

function validarCompra(datos) {
  const proveedorId = Number(datos.proveedorId);
  const numeroDocumento = (datos.numeroDocumento || '').trim();
  const detalles = Array.isArray(datos.detalles) ? datos.detalles : [];

  if (!proveedorId) throw new AppError('Seleccione un proveedor');
  if (!numeroDocumento) throw new AppError('El número de factura es obligatorio');
  if (!['CONTADO', 'CREDITO'].includes(datos.condicion)) {
    throw new AppError('La condición debe ser CONTADO o CREDITO');
  }
  if (detalles.length === 0) throw new AppError('La compra debe tener al menos un insumo');

  // Cada línea: insumo, cantidad > 0 y costo >= 0
  const lineas = detalles.map((d) => {
    const linea = {
      insumoId: Number(d.insumoId),
      cantidad: Number(d.cantidad),
      costoUnitario: Number(d.costoUnitario),
    };
    if (!linea.insumoId) throw new AppError('Hay una línea sin insumo');
    if (!(linea.cantidad > 0)) throw new AppError('La cantidad debe ser mayor a 0');
    if (!(linea.costoUnitario >= 0)) throw new AppError('El costo unitario no puede ser negativo');
    return { ...linea, subtotal: redondear(linea.cantidad * linea.costoUnitario) };
  });

  const fecha = datos.fecha ? new Date(datos.fecha) : new Date();
  if (Number.isNaN(fecha.getTime())) throw new AppError('La fecha no es válida');

  return { proveedorId, numeroDocumento, condicion: datos.condicion, fecha, lineas };
}

export function listarCompras(sucursalId) {
  return prisma.compra.findMany({
    where: { sucursalId },
    include: { proveedor: { select: { nombre: true } }, cuenta: true },
    orderBy: { fecha: 'desc' },
  });
}

export async function obtenerCompra(id, sucursalId) {
  const compra = await prisma.compra.findFirst({
    where: { id, sucursalId },
    include: {
      proveedor: true,
      detalles: { include: { insumo: { select: { nombre: true, unidad: true } } } },
      cuenta: { include: { abonos: { orderBy: { fecha: 'desc' } } } },
    },
  });
  if (!compra) throw new AppError('Compra no encontrada', 404);
  return compra;
}

// Hecho con apoyo de IA (Claude)
// Registra la compra en una transacción: si algo falla no se guarda nada
export async function registrarCompra(sucursalId, datos) {
  const compra = validarCompra(datos);

  const proveedor = await prisma.proveedor.findUnique({ where: { id: compra.proveedorId } });
  if (!proveedor || !proveedor.activo) throw new AppError('Proveedor no encontrado', 404);

  // Verifica que todos los insumos existan antes de empezar
  const ids = [...new Set(compra.lineas.map((l) => l.insumoId))];
  const encontrados = await prisma.insumo.count({ where: { id: { in: ids }, activo: true } });
  if (encontrados !== ids.length) throw new AppError('Uno de los insumos no existe', 404);

  const subtotal = redondear(compra.lineas.reduce((suma, l) => suma + l.subtotal, 0));
  const iva = redondear(subtotal * IVA);
  const total = redondear(subtotal + iva);

  return prisma.$transaction(async (tx) => {
    const nueva = await tx.compra.create({
      data: {
        numeroDocumento: compra.numeroDocumento,
        fecha: compra.fecha,
        condicion: compra.condicion,
        subtotal,
        iva,
        total,
        proveedorId: compra.proveedorId,
        sucursalId,
        detalles: { create: compra.lineas },
      },
    });

    for (const linea of compra.lineas) {
      // Función de Vega: suma stock y registra el kardex
      await sumarStock(tx, sucursalId, linea.insumoId, linea.cantidad, `COMPRA:${nueva.id}`);
      // Se guarda el último costo pagado
      await tx.insumo.update({
        where: { id: linea.insumoId },
        data: { costoUnitario: linea.costoUnitario },
      });
    }

    // Al crédito: se crea la cuenta por pagar con vencimiento según el proveedor
    if (compra.condicion === 'CREDITO') {
      const vencimiento = new Date(compra.fecha);
      vencimiento.setDate(vencimiento.getDate() + proveedor.diasCredito);
      await tx.cuentaPorPagar.create({
        data: { compraId: nueva.id, monto: total, saldo: total, fechaVencimiento: vencimiento },
      });
    }

    return tx.compra.findUnique({ where: { id: nueva.id }, include: { detalles: true, cuenta: true } });
  });
}
