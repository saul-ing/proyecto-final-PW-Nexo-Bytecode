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