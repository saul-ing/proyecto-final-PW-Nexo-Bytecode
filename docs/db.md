# Base de datos

PostgreSQL con Prisma; fuente: backend/prisma/schema.prisma y migración 20261113032006_init. No se ha comparado una base existente con el esquema.

| área | Entidades y relaciones |
|---|---|
| Base | Sucursal 1:N Usuario/Empleado/StockSucursal/Compra/Turno/Venta; Usuario.email único |
| Inventario | Categoria.nombre e Insumo.nombre únicos; Producto→Categoria; REVENTA→Insumo opcional; Producto 1:N RecetaItem→Insumo |
| Stock | StockSucursal único(insumoId,sucursalId); MovimientoInventario referencia insumo/sucursal; cantidades Decimal(14,3) |
| Compra | Compra→Proveedor/Sucursal; único(proveedorId,numeroDocumento); CompraDetalle→Insumo; cuenta opcional única por compra; Abono→CuentaPorPagar/Usuario |
| Venta | Venta→Sucursal/Turno/Usuario/Cliente opcional; único(sucursalId,tipo,correlativo); VentaDetalle→Producto; Pago N:1 Venta |
| Caja | Turno con esperado/contado efectivo,tarjeta,digital; pagos EFECTIVO,TARJETA,BITCOIN,CHIVO_WALLET |
| Nómina | Empleado.dui único; Planilla→PlanillaDetalle→Empleado; único(planillaId,empleadoId); TramoRenta sin periodo/vigencia modelados |

Precios Decimal(10,2), montos Decimal(12,2), costos Decimal(12,4), recetas Decimal(12,3). El esquema no reemplaza validaciones de negocio. Revisar restricciones de cantidades positivas, autorización y concurrencia con el equipo.

El seed original solo prepara sucursal y administrador demo; no incluye menú ni tramos ISR. No se modifica ni ejecuta automáticamente. Fixture independiente: backend/prisma/seed-qa.js, exclusivamente origenes_erp_qa local; datos prefijados QA, transacción, sin borrar ni actualizar registros existentes. Repetir no restablece stocks consumidos. Si un dato QA ya existe, se conserva. No usar como prueba de consistencia de datos preexistentes.

Migraciones: usar migrate deploy para aplicar las versionadas en base nueva; no migrate reset. Respaldos y recuperación de una base real quedan bajo control del propietario; esta entrega no borra bases ni registros.
