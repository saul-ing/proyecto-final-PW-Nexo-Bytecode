# Plan de pruebas sobre la aplicación integrada

Prepara una base desechable con la [guía de despliegue](../despliegue-local.md). Usa las [cuentas del seed](../manual-usuario.md#cuentas-de-demostración). Registra commit, rol, sucursal, entradas, resultado y evidencia de cada ejecución.

| ID | Ejecución | Resultado esperado |
|---|---|---|
| DEP01 | Aplicar migración y seed, levantar API y frontend | Salud 200 y pantalla de inicio disponible. |
| API01 | Consultar sucursales sin sesión y luego iniciar sesión como administrador | 401 sin sesión, perfil ADMIN con sesión. |
| SUC01 | Consultar sucursales y comparar movimientos del mismo insumo entre dos sedes | Se listan las tres sedes y cada operación modifica el stock de su sede. |
| INV01 | Abrir el catálogo e identificar elaborados y reventa | Aparecen 19 productos del seed. |
| VEN01–02 | Abrir caja con $20, vender Latte Grande por CF y CCF, y consultar ambos documentos | $3.10 de base y $0.40 de IVA por venta. CCF usa un cliente con NIT y NRC. |
| INV02 | Comparar existencias antes y después de las dos ventas | Consumo de 36 g de café, 500 ml de leche y dos unidades de cada empaque. |
| INV03 | Vender un artículo de reventa y consultar la alerta al llegar al mínimo | Se descuenta el insumo asociado y se muestra su alerta. |
| COM01 | Comprar a crédito 100 g de café | El stock aumenta en 100 g y se crea una cuenta por pagar. |
| COM02 | Registrar un abono parcial y luego liquidar el saldo | Se actualizan monto y estado después de cada abono. |
| CAJ01–02 | Cerrar con $27 en efectivo tras las dos ventas | La diferencia de efectivo es cero. Para pagos mixtos, comparar también tarjeta y digital. |
| COM02-C | Enviar dos abonos simultáneos, cada uno por todo el saldo de una cuenta | Un HTTP 201, un HTTP 409 y saldo final cero. |
| CAJ03 | Repetir diez rondas de cinco aperturas simultáneas del mismo usuario y cerrar entre rondas | Un HTTP 201 y cuatro HTTP 409 por ronda. |
| NOM01–02 | Generar la quincena, abrir el detalle y comparar un caso con cálculo manual | La planilla incluye empleados del alcance y calcula ISSS, AFP y renta según el tramo. |
| UI01 | Recorrer acceso, POS, inventario, compras y planillas desde el navegador | Se muestran las pantallas y los datos del seed. |
| TEC01 | Ejecutar lint y build del frontend | Ambos comandos finalizan con código cero. |

Los resultados de la ejecución del 25 de noviembre están en [verificación](verificacion.md).
