# Matriz de requisitos del caso 1

Fuente: enunciado de Programación Web, ciclo 02 de 2026, pp. 1–5. Implementación de referencia: `develop` en `3575d81`. Véase la [evidencia ejecutada](verificacion.md).

| Requisito | Implementación | Evidencia |
|---|---|---|
| Varias sucursales | Sucursal, usuarios y stock por sucursal | SUC01 confirmó tres sucursales. Aislamiento entre sucursales queda como prueba específica. |
| POS, IVA 13 %, CF y CCF | POS, Ventas, cliente fiscal y correlativo por tipo | VEN01–02 comprobó ambos documentos y su desglose. |
| Al menos 12 productos elaborados | Seed de 15 elaborados y cuatro de reventa | INV01 consultó los 19 productos. |
| Descuento por receta | RecetaItem, StockSucursal y kárdex | INV02 comprobó los cinco insumos del Latte Grande. |
| Reventa y alertas | Insumo asociado y existencias comparadas con el mínimo | Módulos integrados. INV03 cubre una venta de reventa y el umbral de alerta. |
| Compras y cuentas por pagar | Proveedor, Compra, CuentaPorPagar y Abono | COM01 comprobó ingreso y cuenta. COM02 cubre abonos. |
| Apertura, cierre y cuadre | Turno vinculado a ventas y pagos | CAJ01–02 comprobó apertura y cierre en efectivo. Pagos mixtos se prueban aparte. |
| Personal y planilla quincenal | Empleado, Planilla, TramoRenta y deducciones | NOM01–02 generó ocho líneas y contrastó las deducciones de una. |
| React, rutas, estilos y REST | React, Tailwind, Router, Axios y Express | TEC01 y UI01. |
| Repositorio colaborativo y despliegue | Ramas por módulo, PR y migración versionada | DEP01 y [actividades con evidencia Git](seguimiento.xlsx). |
| Investigación IEEE, manual y documentación técnica | Entregables enlazados en el README | [Investigación](../ieee/informe.pdf), [manual](../manual-usuario.md) y [arquitectura](../arquitectura.md). |
| Declaración de IA en bibliografía | Entradas de Codex y Claude | [Fuente del informe](../ieee/informe.tex). |
