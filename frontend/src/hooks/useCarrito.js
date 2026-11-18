import { useMemo, useState } from 'react';
import { redondear } from '../utils/formato';

// Carrito del POS. Los precios del catálogo ya incluyen el IVA (13%).
export function useCarrito() {
  const [items, setItems] = useState([]);

  const agregar = (producto) => {
    setItems((prev) => {
      const existente = prev.find((i) => i.productoId === producto.id);

      if (existente) {
        // No se puede vender más de lo que hay en stock
        if (existente.cantidad >= producto.disponibles) return prev;
        return prev.map((i) =>
          i.productoId === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }

      if (producto.disponibles < 1) return prev;
      return [
        ...prev,
        {
          productoId: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          disponibles: producto.disponibles,
          cantidad: 1,
        },
      ];
    });
  };

  // delta = +1 o -1. Si llega a 0 la línea se quita
  const cambiarCantidad = (productoId, delta) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.productoId !== productoId) return i;
          return { ...i, cantidad: Math.min(i.cantidad + delta, i.disponibles) };
        })
        .filter((i) => i.cantidad > 0)
    );
  };

  const quitar = (productoId) => setItems((prev) => prev.filter((i) => i.productoId !== productoId));

  const vaciar = () => setItems([]);

  // Mismo cálculo que hace el backend: la base de cada línea se redondea por separado
  const totales = useMemo(() => {
    let subtotal = 0;
    let total = 0;
    items.forEach((i) => {
      const totalLinea = i.precio * i.cantidad;
      subtotal += redondear(totalLinea / 1.13);
      total += totalLinea;
    });
    subtotal = redondear(subtotal);
    total = redondear(total);
    return { subtotal, iva: redondear(total - subtotal), total };
  }, [items]);

  return { items, agregar, cambiarCantidad, quitar, vaciar, totales };
}