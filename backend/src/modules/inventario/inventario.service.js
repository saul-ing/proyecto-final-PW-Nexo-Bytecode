// Cambio: se usa AppError de Saúl para los errores con código HTTP
import { AppError } from '../../utils/AppError.js';

// Funciones de stock que usan otros módulos. Reciben `tx` porque se llaman
// dentro de una transacción ($transaction): si algo falla, se revierte todo.

// Para Meg (Ventas). items = [{ productoId, cantidad }]
// ELABORADO: descuenta cada insumo de su receta.
// REVENTA:   descuenta 1 unidad de su insumoReventa por cada producto vendido.
// Cambio: ahora recibe sucursalId (el stock es por sucursal) y referencia para el kardex
export async function descontarStock(tx, sucursalId, items, referencia) {
  for (const item of items) {
    const producto = await tx.producto.findUnique({
      where: { id: item.productoId },
      include: { receta: true },
    });

    // Cambio: REVENTA ya no tiene stock propio, descuenta 1 de su insumo
    const lineas =
      producto.tipo === 'REVENTA'
        ? [{ insumoId: producto.insumoReventaId, cantidad: 1 }]
        : producto.receta;

    for (const linea of lineas) {
      const consumo = Number(linea.cantidad) * item.cantidad;

      // Resta solo si hay suficiente (gte = mayor o igual)
      // Cambio: se resta en StockSucursal (antes era stockActual del insumo)
      const resultado = await tx.stockSucursal.updateMany({
        where: { insumoId: linea.insumoId, sucursalId, cantidad: { gte: consumo } },
        data: { cantidad: { decrement: consumo } },
      });
      if (resultado.count === 0) {
        throw new AppError(`Stock insuficiente para ${producto.nombre}`, 409);
      }

      // Nuevo: cada salida se registra en el kardex
      await tx.movimientoInventario.create({
        data: { tipo: 'VENTA', cantidad: -consumo, referencia, insumoId: linea.insumoId, sucursalId },
      });
    }
  }
}

// Para Johann (Compras): suma stock de un insumo en la sucursal.
// Cambio: una sola función; upsert crea el stock si la sucursal aún no lo tiene
export async function sumarStock(tx, sucursalId, insumoId, cantidad, referencia) {
  await tx.stockSucursal.upsert({
    where: { insumoId_sucursalId: { insumoId, sucursalId } },
    create: { insumoId, sucursalId, cantidad },
    update: { cantidad: { increment: cantidad } },
  });

  // Nuevo: la entrada se registra en el kardex
  await tx.movimientoInventario.create({
    data: { tipo: 'COMPRA', cantidad, referencia, insumoId, sucursalId },
  });
}