# Incidencias y dependencias

Hallazgos por inspección estática de 7c53311; no equivalen a fallos reproducidos en UI. Responsable nominal pendiente de confirmación; se indica área.

| ID / severidad | Pasos de reproducción o inspección | Esperado | Obtenido / evidencia | Dependencia |
|---|---|---|---|---|
| QA-01 / Alta | Abrir frontend/src/App.jsx y main.jsx | Acceso a login e inventario | App plantilla de Vite; sin router/páginas montadas | Integración frontend |
| QA-02 / Alta | Comparar imports de páginas inventario con frontend/package.json | Dependencias declaradas | Importan reactstrap, ausente; build actual no recorre páginas no importadas | Inventario/frontend |
| QA-03 / Alta, riesgo | Revisar guardarReceta y datosProducto/crearInsumo | Validación de cantidades/costos/precios positivos | Conversión Number sin validación completa de límites; probar negativos en DB QA | Inventario; corrección de lógica requiere consulta |
| QA-04 / Alta, riesgo | Revisar descontarStock con receta vacía | Política que impida vender elaborado sin insumos | Bucle vacío no descuenta; venta integrada aún no disponible | Inventario/ventas |
| QA-05 / Media | Comparar middleware permitirRoles con inventario.routes.js | Política por rol acordada | Solo autenticar, sin restricciones por rol en escrituras | Equipo define permisos |
| QA-06 / Alta | Revisar routes.js y TramoRenta/seed | Flujos de dinero y nómina verificables | Módulos sin integrar; tramos ISR sin cargar | Compañeros responsables; no se asume trabajo ausente |

Para confirmar cada riesgo: ejecutar caso correspondiente del plan en DB QA; adjuntar petición sin secretos, respuesta, stock antes/después y commit. No se cambió lógica de negocio. Nuevas incidencias: registrar fecha, entorno, caso, severidad, pasos, esperado, obtenido, evidencia real y responsable confirmado.

## QA-07 — lint fallido (confirmada)

Severidad media. Ejecutar `npm --prefix frontend run lint`: dos errores react-hooks/set-state-in-effect en InsumosPage.jsx:27 y ProductosPage.jsx:28. Esperado: lint sin errores. Obtenido: exit 1. Componentes existentes sin modificar. Depende de inventario/frontend.

## QA-08 — avisos de dependencias

Durante npm ci: backend reportó 5 vulnerabilidades (2 moderadas, 3 altas); frontend 3 moderadas. Alcance/explotabilidad sin evaluar; no se aplicó audit fix. Reproducir con npm audit por proyecto y revisar el informe actual con el equipo antes de actualizar dependencias.
