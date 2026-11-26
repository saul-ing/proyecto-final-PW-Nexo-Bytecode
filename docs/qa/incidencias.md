# Seguimiento de incidencias

Referencia: `develop` en `5c17615`, 25 de noviembre de 2026.

| Referencia | Hallazgo original | Situación en la versión integrada |
|---|---|---|
| QA-01 / QA-06 | La navegación y los módulos no aparecían en la base inicial | El router monta los módulos. Se accedió a pantallas con el seed y se comprobaron flujos HTTP de ventas, compras, caja y planilla. |
| QA-02 / QA-07 | Reactstrap y errores de lint en pantallas de inventario | Se observó la integración con Tailwind y pasaron lint y build. |
| QA-03 / QA-04 | Límites de cantidades y elaborados con recetas incompletas | El PR #26 corrigió la validación de valores negativos. INV04 comprobó el rechazo de stock, costo, precio y cantidad de receta negativos. INV02 verificó el descuento de los cinco insumos del Latte Grande. |
| QA-05 | Delimitación de permisos | API01 confirmó el inicio de sesión con los cuatro roles y los permisos de consulta de POS y RR. HH. |
| QA-08 | Avisos observados en la instalación inicial | El 25 de noviembre, npm audit reportó en frontend 0 avisos de producción y 3 moderados al incluir desarrollo. En backend reportó 4 altos de la cadena de Prisma en producción y 2 moderados adicionales al incluir desarrollo. npm propone Prisma 7.10.1 para los altos, una actualización mayor que queda pendiente de validación. |

Consulta la [verificación](verificacion.md) para el alcance exacto de las pruebas.
