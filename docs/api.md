## Compras y proveedores

Todas las rutas piden token y rol ADMIN o GERENTE. La sucursal sale del token.

| Método | Ruta | Body | Respuesta |
|---|---|---|---|
| GET | /api/compras/proveedores | — | 200 `{ ok, proveedores }` (solo activos) |
| POST | /api/compras/proveedores | `{ nombre, nit, nrc, telefono, email, diasCredito }` | 201 `{ ok, proveedor }` · 400 datos inválidos · 409 NIT repetido |
| PUT | /api/compras/proveedores/:id | igual que POST | 200 `{ ok, proveedor }` · 404 |
| DELETE | /api/compras/proveedores/:id | — | 200 `{ ok, message }` (borrado lógico) |
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
