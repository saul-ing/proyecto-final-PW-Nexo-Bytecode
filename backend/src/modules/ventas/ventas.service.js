import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';
//sumarStock es para anular venta y regresar al stock
import { descontarStock, sumarStock } from '../inventario/inventario.service.js';


export async function registrarVenta({ sucursalId, usuarioId, tipoDocumento, clienteId, pagos, items }) {
  //Turno abierto?
  const turnoAbierto = await prisma.turno.findFirst({
    where: { sucursalId, estado: 'ABIERTO' }
  });
  if (!turnoAbierto) {
    throw new AppError('No hay un turno de caja abierto en esta sucursal. Debe abrir caja antes de vender.', 400);
  }

  //Requisitos de CCF
  if (tipoDocumento === 'CCF') {
    if (!clienteId) {
      throw new AppError('El Comprobante de Crédito Fiscal requiere un cliente', 400);
    }
    const cliente = await prisma.cliente.findUnique({ where: { id: Number(clienteId) } });
    if (!cliente || !cliente.nit || !cliente.nrc) {
      throw new AppError('El cliente seleccionado para CCF debe tener NIT y NRC registrados', 400);
    }
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError('La venta debe contener al menos un producto', 400);
  }

  //Consukta todos los productos
  const productoIds = [...new Set(items.map(i => Number(i.productoId)))];
  const productosDB = await prisma.producto.findMany({
    where: { id: { in: productoIds } },
    include: { receta: true }
  });
  const mapaProductos = new Map(productosDB.map(p => [p.id, p]));

  // Procesa y calcula totales
  let subtotalGlobal = 0;
  let ivaGlobal = 0;
  let totalGlobal = 0;

  const itemsCalculados = [];

  for (const item of items) {
    const producto = mapaProductos.get(Number(item.productoId));

    if (!producto || !producto.activo) {
      throw new AppError(`Producto con ID ${item.productoId} no encontrado o inactivo`, 404);
    }

    const cantidad = Number(item.cantidad);
    // Se venden unidades completas: 1, 2, 3...
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new AppError(`La cantidad para el producto ${producto.nombre} debe ser un número entero mayor a 0`, 400);
    }

    const precioConIva = Number(producto.precio);
    const totalLinea = precioConIva * cantidad;

    const subtotalLinea = Number((totalLinea / 1.13).toFixed(2));
    const ivaLinea = Number((totalLinea - subtotalLinea).toFixed(2));

    subtotalGlobal += subtotalLinea;
    ivaGlobal += ivaLinea;
    totalGlobal += totalLinea;

    itemsCalculados.push({
      productoId: producto.id,
      cantidad,
      precioUnitario: Number((precioConIva / 1.13).toFixed(4)),
      subtotal: subtotalLinea
    });
  }

  subtotalGlobal = Number(subtotalGlobal.toFixed(2));
  ivaGlobal = Number(ivaGlobal.toFixed(2));
  totalGlobal = Number(totalGlobal.toFixed(2));

  //Validacion de pagos
  if (!Array.isArray(pagos) || pagos.length === 0) {
    throw new AppError('Debe especificar al menos un método de pago', 400);
  }

  for (const p of pagos) {
    if (!p.medio || Number(p.monto) <= 0 || !Number.isFinite(Number(p.monto))) {
      throw new AppError('Cada pago debe tener un medio válido y un monto mayor a 0', 400);
    }
  }

  const sumaPagos = pagos.reduce((acc, p) => acc + Number(p.monto), 0);
  if (Number(sumaPagos.toFixed(2)) < totalGlobal) {
    throw new AppError(`El monto pagado ($${sumaPagos.toFixed(2)}) es menor al total de la venta ($${totalGlobal.toFixed(2)})`, 400);
  }

  const ventaCreada = await prisma.$transaction(async (tx) => {
    const correlativoRecord = await tx.correlativo.upsert({
      where: { sucursalId_tipo: { sucursalId, tipo: tipoDocumento } },
      create: { sucursalId, tipo: tipoDocumento, ultimo: 1 },
      update: { ultimo: { increment: 1 } }
    });

    const correlativoNum = correlativoRecord.ultimo;
    const referenciaKardex = `${tipoDocumento}-${correlativoNum}`;

    await descontarStock(
      tx,
      sucursalId,
      itemsCalculados.map(i => ({ productoId: i.productoId, cantidad: i.cantidad })),
      referenciaKardex
    );
    
    const venta = await tx.venta.create({
      data: {
        tipo: tipoDocumento,
        correlativo: correlativoNum,
        subtotal: subtotalGlobal,
        iva: ivaGlobal,
        total: totalGlobal,
        sucursalId,
        turnoId: turnoAbierto.id,
        usuarioId,
        clienteId: clienteId ? Number(clienteId) : null,
        detalles: {
          create: itemsCalculados.map(i => ({
            productoId: i.productoId,
            cantidad: i.cantidad,
            precioUnitario: i.precioUnitario,
            subtotal: i.subtotal
          }))
        },
        pagos: {
          create: pagos.map(p => ({
            medio: p.medio,
            monto: Number(p.monto),
            referencia: p.referencia || null
          }))
        }
      },
      include: {
        detalles: { include: { producto: true } },
        pagos: true,
        cliente: true
      }
    });

    return venta;
  });

  return ventaCreada;
}

//Lista ventas por sucursal
export async function listarVentas({ sucursalId, turnoId, fecha }) {
  const where = { sucursalId };
  if (turnoId) where.turnoId = Number(turnoId);
  if (fecha) {
    const inicio = new Date(`${fecha}T00:00:00.000-06:00`);
    const fin = new Date(`${fecha}T23:59:59.999-06:00`);
    where.fecha = { gte: inicio, lte: fin };
  }

  return await prisma.venta.findMany({
    where,
    include: {
      cliente: true,
      usuario: { select: { id: true, nombre: true } },
      detalles: { include: { producto: true } },
      pagos: true,
      sucursal: true // para el encabezado de la factura
    },
    orderBy: { fecha: 'desc' }
  });
}

//detalle factura por id
export async function obtenerVentaPorId(ventaId, sucursalId) {
  const venta = await prisma.venta.findFirst({
    where: { id: Number(ventaId), sucursalId },
    include: {
      cliente: true,
      usuario: { select: { id: true, nombre: true } },
      detalles: { include: { producto: true } },
      pagos: true,
      turno: true,
      sucursal: true
    }
  });

  if (!venta) {
    throw new AppError('Venta no encontrada', 404);
  }
  return venta;
}


//anula venta y devuelve stock
export async function anularVenta(ventaId, sucursalId) {
  const venta = await prisma.venta.findFirst({
    where: { id: Number(ventaId), sucursalId },
    include: {
      detalles: {
        include: {
          producto: {
            include: { receta: true, insumoReventa: true }
          }
        }
      }
    }
  });

  if (!venta) {
    throw new AppError('Venta no encontrada', 404);
  }
  if (venta.estado === 'ANULADA') {
    throw new AppError('La venta ya se encuentra anulada', 400);
  }

  const ventaAnulada = await prisma.$transaction(async (tx) => {
    // 1. Cambiar estado de la venta a ANULADA
    const actualizada = await tx.venta.update({
      where: { id: Number(ventaId) },
      data: { estado: 'ANULADA' }
    });

    const referenciaAnulacion = `ANULACION:${venta.tipo}-${venta.correlativo}`;

    for (const detalle of venta.detalles) {
      const producto = detalle.producto;
      const cantidadVendida = Number(detalle.cantidad);

      const lineasStock =
        producto.tipo === 'REVENTA'
          ? (producto.insumoReventaId ? [{ insumoId: producto.insumoReventaId, cantidad: 1 }] : [])
          : producto.receta;

      for (const linea of lineasStock) {
        if (!linea.insumoId) continue;
        const cantidadDevolver = Number(linea.cantidad) * cantidadVendida;
        await sumarStock(
          tx,
          sucursalId,
          linea.insumoId,
          cantidadDevolver,
          referenciaAnulacion,
          'AJUSTE' // en el kardex no es una compra, es la devolución por anular
        );
      }
    }

    return actualizada;
  });

  return ventaAnulada;
}