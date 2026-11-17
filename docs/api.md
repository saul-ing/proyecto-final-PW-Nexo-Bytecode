# API implementada

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

Unidades: G, ML, UNIDAD. Tipos: ELABORADO, REVENTA. El precio incluye IVA según comentario del esquema, sin cálculo de facturación integrado. Para editar enviar todos los campos indicados: no existe contrato PATCH. No documentar rutas de módulos pendientes como implementadas.
