import { sumarStock } from '../../src/modules/inventario/inventario.service.js';

const PROVEEDORES = [
  { nombre: 'Café de Altura S.A. de C.V.', nit: '0614-150398-101-2', nrc: '112233-4', telefono: '2244-5566', email: 'ventas@cafedealtura.sv', diasCredito: 30 },
  { nombre: 'Lácteos La Esperanza', nit: '0614-200190-102-3', nrc: '223344-5', telefono: '2222-3333', diasCredito: 15 },
  { nombre: 'Empaques y Desechables SV', nit: '0614-010505-103-4', nrc: '334455-6', telefono: '2275-1010', diasCredito: 0 },
  { nombre: 'Distribuidora El Panadero', nit: '0614-110712-104-5', nrc: '445566-7', telefono: '2260-8080', diasCredito: 8 },
];

// Cada compra deja un caso distinto de cuenta por pagar para la demo
const COMPRAS = [
  { proveedor: 'Café de Altura S.A. de C.V.', factura: 'CA-1001', diasAtras: 20, condicion: 'CREDITO', abonos: [40],
    lineas: [['Café de especialidad', 3000, 0.024]] }, // PARCIAL
  { proveedor: 'Lácteos La Esperanza', factura: 'LE-501', diasAtras: 25, condicion: 'CREDITO', abonos: [],
    lineas: [['Leche entera', 10000, 0.0011], ['Queso', 2000, 0.013]] }, // PENDIENTE y vencida
  { proveedor: 'Empaques y Desechables SV', factura: 'ED-332', diasAtras: 5, condicion: 'CONTADO', abonos: [],
    lineas: [['Vaso 16oz', 200, 0.095], ['Tapadera', 400, 0.038], ['Viñeta', 400, 0.018]] },
  { proveedor: 'Distribuidora El Panadero', factura: 'EP-078', diasAtras: 12, condicion: 'CREDITO', abonos: 'TOTAL',
    lineas: [['Harina de trigo', 5000, 0.0019], ['Mantequilla', 2000, 0.0095]] }, // PAGADA
];

const redondear = (n) => Math.round(n * 100) / 100;

const haceDias = (dias) => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return fecha;
};

export async function seedCompras(prisma, sucursales, insumos) {
  const sucursalId = sucursales[0].id;
  const admin = await prisma.usuario.findUnique({ where: { email: 'admin@origenes.sv' } });

  const proveedores = {};
  for (const p of PROVEEDORES) {
    proveedores[p.nombre] = await prisma.proveedor.upsert({ where: { nit: p.nit }, update: {}, create: p });
  }

  for (const c of COMPRAS) {
    const proveedor = proveedores[c.proveedor];
    const yaExiste = await prisma.compra.findUnique({
      where: { proveedorId_numeroDocumento: { proveedorId: proveedor.id, numeroDocumento: c.factura } },
    });
    if (yaExiste) continue;

    const detalles = c.lineas.map(([insumo, cantidad, costoUnitario]) => ({
      insumoId: insumos[insumo], cantidad, costoUnitario, subtotal: redondear(cantidad * costoUnitario),
    }));
    const subtotal = redondear(detalles.reduce((suma, d) => suma + d.subtotal, 0));
    const iva = redondear(subtotal * 0.13);
    const total = redondear(subtotal + iva);
    const fecha = haceDias(c.diasAtras);

    // Igual que una compra real: compra, stock, kárdex y cuenta en una transacción
    await prisma.$transaction(async (tx) => {
      const compra = await tx.compra.create({
        data: {
          numeroDocumento: c.factura, fecha, condicion: c.condicion, subtotal, iva, total,
          proveedorId: proveedor.id, sucursalId, detalles: { create: detalles },
        },
      });
      for (const d of detalles) {
        await sumarStock(tx, sucursalId, d.insumoId, d.cantidad, `COMPRA:${compra.id}`);
      }
      if (c.condicion !== 'CREDITO') return;

      const vencimiento = new Date(fecha);
      vencimiento.setDate(vencimiento.getDate() + proveedor.diasCredito);
      const montos = c.abonos === 'TOTAL' ? [total] : c.abonos;
      const abonado = redondear(montos.reduce((suma, m) => suma + m, 0));
      const saldo = redondear(total - abonado);

      await tx.cuentaPorPagar.create({
        data: {
          compraId: compra.id, monto: total, saldo, fechaVencimiento: vencimiento,
          estado: saldo === 0 ? 'PAGADA' : abonado > 0 ? 'PARCIAL' : 'PENDIENTE',
          abonos: { create: montos.map((monto) => ({ monto, medioPago: 'EFECTIVO', nota: 'Abono de prueba', usuarioId: admin.id })) },
        },
      });
    });
  }
}
