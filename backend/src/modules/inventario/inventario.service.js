// Funciones de stock que usan otros módulos. Reciben `tx` porque se llaman
// dentro de una transacción ($transaction): si algo falla, se revierte todo.

// Para Meg (Ventas). items = [{ productoId, cantidad }]
// ELABORADO: resta cada insumo de su receta. REVENTA: resta del producto.
export async function descontarStock(tx, items) {
  for (const item of items) {
    const producto = await tx.producto.findUnique({
      where: { id: item.productoId },
      include: { receta: { include: { insumo: true } } },
    });

    if (producto.tipo === 'REVENTA') {
      await restar(tx, 'producto', producto.id, item.cantidad, producto.nombre);
    } else {
      for (const linea of producto.receta) {
        await restar(tx, 'insumo', linea.insumoId, Number(linea.cantidad) * item.cantidad, linea.insumo.nombre);
      }
    }
  }
}

// Resta solo si hay suficiente stock (gte = mayor o igual). Si no alcanza, lanza error 409.
async function restar(tx, modelo, id, cantidad, nombre) {
  const resultado = await tx[modelo].updateMany({
    where: { id, stockActual: { gte: cantidad } },
    data: { stockActual: { decrement: cantidad } },
  });

  if (resultado.count === 0) {
    const error = new Error(`Stock insuficiente de ${nombre}`);
    error.status = 409;
    throw error;
  }
}

// Para Johann (Compras): suma stock a un insumo o a un producto de reventa.
export async function sumarStockInsumo(tx, insumoId, cantidad) {
  return tx.insumo.update({ where: { id: insumoId }, data: { stockActual: { increment: cantidad } } });
}

export async function sumarStockProducto(tx, productoId, cantidad) {
  return tx.producto.update({ where: { id: productoId }, data: { stockActual: { increment: cantidad } } });
}