# Contratos HTTP de la API

Referencia: develop, commit 3575d81.

Base: http://127.0.0.1:3000/api. JSON de éxito con ok:true; errores {ok:false,message}. Todas las rutas inventario requieren Authorization: Bearer TOKEN. No guardar el token en documentación/evidencia.

| Método | Ruta relativa | Entrada / respuesta |
|---|---|---|
| GET | /health | {ok:true,message}; no comprueba DB |
| POST | /auth/login | {email,password} — {ok,token,usuario}; 400 incompleto,401 inválido |
| GET | /auth/me | Bearer — {ok,usuario} |
| GET | /inventario/insumos | {ok,insumos}; stock de sucursal JWT |
| POST | /inventario/insumos | {nombre,unidad,costoUnitario,cantidad,stockMinimo} — 201 {ok,insumo} |
| PUT | /inventario/insumos/:id | {nombre,unidad,costoUnitario,stockMinimo}; no edita cantidad |
| DELETE | /inventario/insumos/:id | Desactiva globalmente el insumo |
| GET | /inventario/productos | {ok,productos}; categoría, reventa y receta |
| GET | /inventario/productos/:id | {ok,producto};404 inexistente |
| POST | /inventario/productos | {nombre,tipo,precio,categoria,insumoReventaId?} →201 |
| PUT | /inventario/productos/:id | Mismos campos; categoría como texto |
| DELETE | /inventario/productos/:id | Desactiva globalmente |
| PUT | /inventario/productos/:id/receta | {lineas:[{insumoId,cantidad}]} reemplaza receta;400 vacía |
| GET | /inventario/alertas | {ok,alertas}; cantidad<=mínimo en sucursal JWT |

Las unidades de inventario son G, ML y UNIDAD. Los productos pueden ser ELABORADO o REVENTA. El precio de catálogo incluye IVA y el módulo de ventas desglosa la base y el impuesto. Para editar envía los campos indicados por la ruta PUT.

## Caja y turnos

Todas las rutas piden token y rol ADMIN, GERENTE o CAJERO.

| Método | Ruta | Body | Respuesta |
|---|---|---|---|
| POST | /api/caja/turnos/abrir | `{ montoInicial }` | 201 `{ ok, turno }` · 409 si ya hay un turno abierto |
| GET | /api/caja/turnos/actual | — | 200 `{ ok, turno }` (`turno` es null si no hay uno abierto) |
| POST | /api/caja/turnos/cerrar | `{ contadoEfectivo, contadoTarjeta, contadoDigital, observaciones }` | 200 `{ ok, turno, diferencias }` · 404 si no hay turno abierto |

### Cómo se calcula el cuadre

- **Efectivo esperado** = fondo inicial + pagos en efectivo de las ventas EMITIDAS del turno.
- **Tarjeta esperada** = pagos con tarjeta.
- **Digital esperado** = pagos con Bitcoin + Chivo Wallet.
- `diferencias` = contado − esperado. Negativo es faltante, positivo es sobrante.

Ventas vincula cada comprobante al turno abierto de la sucursal. Caja consulta y cierra el turno abierto del usuario.

## Compras y proveedores

Todas las rutas piden token y rol ADMIN o GERENTE. La sucursal sale del token.

| Método | Ruta | Body | Respuesta |
|---|---|---|---|
| GET | /api/compras/proveedores | — | 200 `{ ok, proveedores }` (solo activos) |
| POST | /api/compras/proveedores | `{ nombre, nit, nrc, telefono, email, diasCredito }` | 201 `{ ok, proveedor }` · 400 datos inválidos · 409 NIT repetido |
| PUT | /api/compras/proveedores/:id | igual que POST | 200 `{ ok, proveedor }` · 404 |
| DELETE | /api/compras/proveedores/:id | — | 200 `{ ok, message }` (borrado lógico) |
| GET | /api/compras/proveedores/:id/estado-cuenta | — | 200 `{ ok, proveedor, compras, resumen }` · 404 |
| GET | /api/compras | — | 200 `{ ok, compras }` |
| GET | /api/compras/:id | — | 200 `{ ok, compra }` con detalles y cuenta · 404 |
| POST | /api/compras | `{ proveedorId, numeroDocumento, fecha, condicion, detalles: [{ insumoId, cantidad, costoUnitario }] }` | 201 `{ ok, compra }` · 400 · 404 proveedor/insumo · 409 factura repetida |
| GET | /api/compras/cuentas?estado= | — | 200 `{ ok, cuentas }` (cada una con `vencida`) |
| POST | /api/compras/cuentas/:id/abonos | `{ monto, medioPago, nota }` | 201 `{ ok, cuenta }` · 404 · 409 cuenta pagada o abono mayor al saldo |

### Qué pasa al registrar una compra

Todo ocurre en una transacción (si algo falla, no se guarda nada):

1. Se crea la compra con sus líneas. Subtotal = Σ cantidad × costo, IVA 13 %, total = subtotal + IVA.
2. Por cada línea se llama `sumarStock()` de Inventario: sube el stock de la sucursal y registra el movimiento `COMPRA` en el kárdex.
3. Se actualiza el `costoUnitario` del insumo con el último costo pagado.
4. Si la condición es `CREDITO` se crea la cuenta por pagar con `saldo = total` y vencimiento = fecha + `diasCredito` del proveedor.

### Abonos

- El saldo se resta solo si alcanza (`saldo >= monto`), así dos abonos al mismo tiempo no pueden pagar de más.
- Saldo en 0 → `PAGADA`; si queda saldo → `PARCIAL`.
- Una cuenta está **vencida** si pasó su fecha de vencimiento y no está pagada.

### Estado de cuenta del proveedor

`resumen` trae: `totalComprado` (contado + crédito), `totalCredito`, `totalAbonado`, `saldoPendiente` y `saldoVencido`.
Cada compra viene con su `cuenta` y el historial de `abonos` (null si fue de contado).

## POS (catálogo y clientes)

Todas las rutas piden token y rol ADMIN, GERENTE o CAJERO. La sucursal sale del token.

| Método | Ruta | Body / Query | Respuesta |
|---|---|---|---|
| GET | /api/pos/categorias | — | 200 `{ ok, categorias }` (solo con productos activos) |
| GET | /api/pos/productos?categoriaId=&buscar= | filtros opcionales | 200 `{ ok, productos }` · 400 categoría inválida |
| GET | /api/pos/clientes?buscar= | nombre o NIT | 200 `{ ok, clientes }` (máximo 10) |
| POST | /api/pos/clientes | `{ nombre, nit, nrc, giro, direccion, telefono, email }` | 201 `{ ok, cliente }` · 400 faltan nombre, NIT o NRC · 409 NIT repetido |

### Productos del POS

Cada producto trae `id, nombre, tipo, precio, categoriaId, categoria, disponibles`. El `precio` ya incluye el IVA.

`disponibles` son las unidades que se pueden vender con el stock de la sucursal: se divide el stock de cada insumo de la receta entre lo que gasta una unidad y se toma el menor. En productos de reventa se usa el stock de su insumo. Un producto sin receta sale con 0.

### Cobro con pagos mixtos

El POS registra la venta con `POST /api/ventas`. Los pagos que se envían deben sumar el total de la venta: si el cliente paga de más en efectivo, el vuelto se resta del monto en efectivo antes de enviarlo. Así el cuadre de caja no queda inflado.
## Sucursales

| Método | Ruta | Body | Respuesta |
|---|---|---|---|
| GET | /api/sucursales | — | 200 `{ ok, sucursales }` (solo activas) · 401 sin token |

Cualquier usuario con sesión puede consultarlas (sirve para selectores, por ejemplo en empleados).

| Método | Ruta | Datos y resultado |
|---|---|---|
| GET | /api/sucursales/:id | Devuelve `{ ok, sucursal }`. |
| POST | /api/sucursales | Solo ADMIN. Recibe `nombre`, `direccion` y `telefono`. Devuelve 201 y `{ ok, sucursal }`. |
| PUT | /api/sucursales/:id | Solo ADMIN. Actualiza `nombre`, `direccion`, `telefono` y `activa`. |

## Ventas

Las solicitudes requieren token. El servicio registra y consulta comprobantes en el contexto de la sucursal del usuario.

| Método | Ruta | Datos y resultado |
|---|---|---|
| POST | /api/ventas | `{ tipoDocumento, clienteId, items: [{ productoId, cantidad }], pagos: [{ medio, monto }] }`. Devuelve 201 y `{ ok, venta }`. Requiere turno abierto. CCF exige cliente con NIT y NRC. |
| GET | /api/ventas | Filtros opcionales `turnoId` y `fecha` (YYYY-MM-DD). Devuelve `{ ok, ventas }`. |
| GET | /api/ventas/:id | Devuelve `{ ok, venta }`. |
| PATCH | /api/ventas/:id/anular | Anula la venta y reintegra existencias mediante movimientos de inventario. Devuelve `{ ok, message, venta }`. |

El precio de catálogo incluye IVA. Por línea, el subtotal se calcula dividiendo el total entre 1.13. El IVA es la diferencia entre el total y la base redondeada. Los correlativos se asignan por sucursal y tipo de documento.

## Empleados y planillas

Requiere ADMIN o GERENTE. Para el listado de empleados y la gestión de períodos, gerencia usa el alcance de su sucursal. Las respuestas exitosas tienen `{ ok, data }`.

| Método | Ruta | Datos |
|---|---|---|
| GET | /api/rrhh/empleados | Filtros opcionales `activo` y `sucursalId`. |
| GET | /api/rrhh/empleados/:id | Ficha del empleado. |
| POST | /api/rrhh/empleados | Nombre, DUI, cargo, salario mensual, fecha de ingreso y sucursal. NIT, ISSS y AFP son campos adicionales. |
| PUT | /api/rrhh/empleados/:id | Actualiza los campos de la ficha. |
| PATCH | /api/rrhh/empleados/:id/desactivar | Desactiva al empleado. |
| GET | /api/rrhh/planillas | Filtro opcional `sucursalId`. |
| POST | /api/rrhh/planillas/generar | `{ fechaInicio, fechaFin, sucursalId }`. Devuelve 201. |
| GET | /api/rrhh/planillas/:id | Detalle de la planilla. |
| PATCH | /api/rrhh/planillas/:id/pagar | Marca la planilla como pagada. |

Para datos de demostración, consulta el [seed principal](db.md#seed-principal).
