# Seguimiento de incidencias

Referencia: `develop` en `3575d81`, 24 de noviembre de 2026.

| Referencia | Hallazgo original | Situación en la versión integrada |
|---|---|---|
| QA-01 / QA-06 | La navegación y los módulos no aparecían en la base inicial | El router monta los módulos. Se accedió a pantallas con el seed y se comprobaron flujos HTTP de ventas, compras, caja y planilla. |
| QA-02 / QA-07 | Reactstrap y errores de lint en pantallas de inventario | Se observó la integración con Tailwind y pasaron lint y build. |
| QA-03 / QA-04 | Límites de cantidades y elaborados con recetas incompletas | El flujo con Latte Grande pasó. Las pruebas de límites se registran por separado. |
| QA-05 | Delimitación de permisos | La API usa autenticación y controles de rol por módulo. Se recomienda registrar resultados del recorrido por rol cuando se ejecute. |
| QA-08 | Avisos observados en la instalación inicial | El estado de dependencias requiere una auditoría de la versión instalada antes de promoverla a otro entorno. |

Consulta la [verificación](verificacion.md) para el alcance exacto de las pruebas.
