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

### Para otros módulos

- Ventas: usar `exigirTurnoAbierto(tx, usuarioId)` de `modules/caja/caja.service.js` y guardar su `id` en `venta.turnoId`.

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

## Datos de prueba (seed)

`npm run db:seed` carga todo y se puede correr varias veces sin duplicar datos. Cada módulo tiene su archivo en `backend/prisma/seeds/`.

- **Sucursales:** Casa Matriz, Santa Tecla y San Miguel.
- **Usuarios:** `admin`, `gerente`, `cajero` y `barista` `@origenes.sv` (contraseñas en `seeds/base.js`).
- **Inventario:** 26 insumos con stock en las 3 sucursales, 15 productos elaborados con receta (incluido el Latte Grande del enunciado) y 4 de reventa. La leche de almendra empieza bajo el mínimo para mostrar la alerta.
- **Clientes:** 3 con NIT y NRC para emitir CCF.
- **Compras:** 4 proveedores y 4 compras: una de contado y cuentas por pagar pendiente y vencida, parcial y pagada.
- **RRHH:** 8 empleados repartidos en las sucursales y la tabla de renta quincenal.
