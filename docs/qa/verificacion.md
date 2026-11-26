# Verificación de la versión integrada

Fecha: 25 de noviembre de 2026. Versión: `develop`, commit `5c17615`. Entorno: Windows, Node 24.21.0, Prisma 6.19.3, PostgreSQL 18 y Chrome. Se usó una copia temporal, una base nueva en loopback y el seed principal del proyecto.

| ID | Verificación | Evidencia |
|---|---|---|
| DEP01 | Migración y seed | Se aplicó `20261113032006_init` y el seed finalizó. La aplicación inició con sus datos. |
| API01 | Salud y autenticación | Salud HTTP 200 y sucursales sin sesión HTTP 401. Las cuatro cuentas del seed iniciaron sesión. POS aceptó ADMIN, GERENTE y CAJERO y devolvió 403 a BARISTA. RR. HH. aceptó ADMIN y GERENTE y devolvió 403 a CAJERO y BARISTA. |
| SUC01 | Aislamiento entre sucursales | Se consultaron las tres sucursales. Se agregó una cuenta temporal para Santa Tecla. La venta de agua en Casa Matriz dejó el stock de Santa Tecla en 100 y consultar el comprobante desde esa sede devolvió HTTP 404. |
| INV01 | Catálogo POS | 19 productos consultados. Latte Grande visible en el catálogo. |
| VEN01–02 | Venta CF y CCF | Se registraron y consultaron ambos comprobantes. Cada uno totalizó $3.50, con base $3.10 e IVA $0.40. Para CCF se seleccionó un cliente del seed. |
| INV02 | Descuento por receta | Dos bebidas descontaron 36 g de café, 500 ml de leche y dos vasos, dos tapaderas y dos viñetas. |
| COM01 | Compra a crédito | Compra registrada, aumento de 100 g de café y cuenta por pagar consultada. |
| CAJ01–02 | Apertura y cierre | Fondo de $20 y dos ventas en efectivo por $7. Cierre con $27 y diferencias cero. |
| NOM01–02 | Planilla | Generación desde el formulario y consulta de ocho detalles para el período del 1 al 15 de noviembre de 2026. Para $950 mensuales, se comprobó bruto de $475.00, ISSS $14.25, AFP $34.44, renta $23.96 y neto $402.35. |
| COM02 | Abono parcial y liquidación | Factura LE-501 del seed, saldo inicial $41.81. Un abono de $10.00 dejó saldo $31.81 y estado PARCIAL. El abono de $31.81 dejó saldo $0.00 y estado PAGADA. Ambas solicitudes devolvieron HTTP 201 y quedaron registrados los dos abonos. |
| COM02-C | Abonos simultáneos | Dos solicitudes por el saldo completo de la misma cuenta. Una devolvió 201 y la otra 409. La cuenta quedó PAGADA con saldo cero. |
| CAJ03 | Aperturas simultáneas | Diez rondas de cinco solicitudes para el mismo usuario. Cada ronda produjo un 201 y cuatro 409. Se cerró el único turno de cada ronda. |
| INV03 | Reventa y mínimo | Se fijó el mínimo del agua en 99 en Casa Matriz. La venta redujo el stock de 100 a 99 y apareció la alerta en esa sede. |
| INV04 | Valores negativos | Stock, costo, precio y cantidad de receta negativos devolvieron HTTP 400. |
| CAJ04 | Cierre con pagos mixtos | Venta de $1.00, repartida en cuatro pagos de $0.25. Con fondo de $20.00, el cierre esperaba $20.25 en efectivo, $0.25 en tarjeta y $0.50 en digital (Bitcoin y Chivo Wallet). Las tres diferencias fueron cero. |
| UI01 | Pantallas en ejecución | Se capturaron inicio de sesión, POS, inventario, cuentas por pagar y planillas. |
| TEC01 | Lint y compilación | ESLint y build de producción de `develop` pasaron en la revisión del 25 de noviembre. |

La planilla se generó en Chrome, con zona horaria de El Salvador (UTC−6). El formulario envió las fechas a las 12:00 y el listado mostró del 1 al 15 de noviembre. Las ventas, la compra y el cierre se comprobaron por HTTP sobre PostgreSQL. La captura de cuentas por pagar se tomó antes de registrar la compra de verificación. Para repetir la revisión, sigue la [guía de despliegue](../despliegue-local.md) y el [plan de pruebas](plan-pruebas.md).

## Evidencia de aportes de QA

Los commits de QA y despliegue que se citan en el Excel se conservan en la rama original. Se pueden consultar en GitHub: [matriz y documentación](https://github.com/saul-ing/proyecto-final-PW-Nexo-Bytecode/commit/7fea7a70294fa28b978b450db80d4465223d4da2), [pruebas de contrato](https://github.com/saul-ing/proyecto-final-PW-Nexo-Bytecode/commit/e9f8b0c99b2a21bad55b0b02c28fbfb0b4d2e0fb) y [demostración local](https://github.com/saul-ing/proyecto-final-PW-Nexo-Bytecode/commit/70e34bc8a246ffbf2577f61e6170940cad389547).
