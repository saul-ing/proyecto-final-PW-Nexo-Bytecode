# Matriz de requisitos — caso 1

Fuente académica: Proyecto - Progra Web - 2026.pdf, 5 páginas, leído el 2026-11-16. Base inspeccionada: `7c53311` de develop. No se evalúa el caso 2. “Parcial” describe evidencia en código, no aprobación de una prueba.

| ID | Requisito explícito / página | Evidencia actual | Casos | Estado y dependencia |
|---|---|---|---|---|
| R01 | Sistema centralizado, varias sucursales / 2 | Sucursal, Usuario, StockSucursal; sucursal del JWT | SUC01 | Parcial; falta flujo completo |
| R02 | POS ágil, CF/CCF, correlativos, IVA 13% / 2 | Modelos Venta, Correlativo, Pago; sin rutas integradas | VEN01–03 | Pendiente integración del equipo de POS/ventas |
| R03 | 12 productos elaborados / 2 | Producto, RecetaItem; fixtures QA preparados | INV01 | Carga y verificación DB pendientes |
| R04 | Descuento automático de receta / 2 | descontarStock en inventario.service.js | INV02–04 | Parcial; integración con ventas pendiente |
| R05 | Reventa / 2 | insumoReventaId, descontarStock | INV05 | Parcial; venta completa pendiente |
| R06 | Alertas de stock mínimo / 2 | GET inventario/alertas; comparación <= | INV06 | Parcial; ejecución DB pendiente |
| R07 | Compras, inventario, cuentas por pagar / 2 | Modelos Compra, CuentaPorPagar; sumarStock | COM01–02 | Pendiente integración de compras |
| R08 | Apertura/cierre por turno y cuadre de efectivo, tarjeta, Bitcoin/Chivo / 2 | Turno y MedioPago | CAJ01–02 | Pendiente integración de caja |
| R09 | Empleados y planilla quincenal; ISSS 3%, AFP 7.25%, ISR vigente / 2 | Empleado, Planilla, TramoRenta; seed no carga tramos | NOM01–02 | Pendiente RRHH y fuente oficial vigente |
| T01 | let/const, funciones, métodos, string/number/boolean/object / 3 | Controladores, servicios y componentes | TEC01 | Evidencia estática, defensa pendiente |
| T02 | Arrays, iteradores, hooks y componentes React / 4 | Páginas inventario: map, useState, useEffect | TEC01 | Parcial; páginas no montadas |
| T03 | Reactstrap o Tailwind; enrutadores React / 4 | Tailwind en Vite; Link/useParams en páginas | UI01 | Router sin montar; Reactstrap no declarado |
| T04 | API async/promesas, REST, HTTP, try/catch y errores / 4 | Axios, controladores, middleware de errores | API01–04 | Parcial; ver ejecución |
| T05 | Buen diseño visual y UX / 4 | App aún plantilla de Vite | UI01 | Bloqueado por integración de interfaz |
| E01 | GitHub colaborativo y participación / 2,4 | Historial y ramas remotas | ENT01 | Historial disponible; no equivale a validar aportes individuales |
| E02 | Funcional desde equipo que clone; despliegue / 2,4 | Guía local y servidor de estáticos/proxy preparados | DEP01 | Otro equipo no probado |
| E03 | Investigación IEEE enviada antes de defensa / 2,5 | Borrador docs/ieee | ENT01 | Formato, autores, revisión y envío pendientes del equipo |
| E04 | Seguimiento (p. ej. Excel), manual, documentación técnica / 5 | docs y seguimiento generado | ENT01 | Revisión del equipo pendiente |
| E05 | Declarar IA en bibliografía y comprender solución / 1,4 | Declaración en borrador IEEE | ENT01 | Completar herramientas/usos y preparar defensa |

Acuerdo del equipo comunicado por el usuario: QA, documentación y despliegue son su responsabilidad. Recomendaciones técnicas: base QA separada, fixtures aislados, pruebas por capas y servidor local con proxy. Estas decisiones no son requisitos impuestos por el PDF. Nginx/Apache aparecen entre tecnologías permitidas, no obligatorias.
