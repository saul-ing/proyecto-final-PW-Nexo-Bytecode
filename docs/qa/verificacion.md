# Registro de verificación

Fecha: 2026-11-16 (America/Guatemala). Código base evaluado: develop `7c533111f570b44d1a0033d187bc5a0ebdddae33`; adiciones realizadas en feature/qa-documentacion-despliegue. Los commits de esta rama identifican los artefactos de QA y despliegue; no se evaluaron contenidos de ramas ajenas.

Entorno real: Windows, Node v24.21.0, npm 11.19.0, Prisma CLI/cliente 6.19.3, Vite compilador 8.3.7. PostgreSQL: versión/conexión NO verificadas. No se leyeron .env privados ni se migraron bases. Pruebas HTTP/servidor usan DATABASE_URL ficticia a puerto 1 y no acceden a PostgreSQL.

| Verificación | Resultado real | Alcance/evidencia |
|---|---|---|
| Estado inicial Git | APROBADA | develop limpio; base 7c53311 |
| Instrucciones locales | Revisión realizada | rg no encontró AGENTS.md en repositorio; sin archivo en directorio Escritorio |
| GitHub: git ls-remote --heads origin | APROBADA | develop coincide con 7c53311; ramas caja-turnos, compras-proveedores, inventario-recetas, ventas-facturacion; sin merge/fetch/push |
| npm ci backend | APROBADA con avisos | 144 paquetes añadidos; auditoría: 5 vulnerabilidades, 2 moderadas/3 altas; scripts Prisma requieren generación explícita |
| npm ci frontend | APROBADA con avisos | 183 paquetes añadidos; auditoría: 3 moderadas |
| npm run db:generate | APROBADA | Cliente Prisma 6.19.3 generado, sin conexión DB |
| prisma validate desde backend | APROBADA | Esquema válido; URL ficticia |
| npm run qa:test | APROBADA | 7 comprobaciones, 0 fallos: catálogo, grupo HTTP y 5 subpruebas health/404/sin token/token inválido/login vacío |
| npm run build:frontend | APROBADA con alcance limitado | Vite 8.3.7, 20 módulos; App plantilla, no prueba pantallas inventario |
| npm --prefix frontend run lint | FALLIDA | Dos errores react-hooks/set-state-in-effect: InsumosPage.jsx:27, ProductosPage.jsx:28; QA-07 |
| node --check servidor local y seed QA | APROBADA | Sintaxis; no valida ejecución DB |
| Barreras seed QA | APROBADA | URL de otra base y contraseña corta rechazadas antes de conectar; subprocesos retornaron error esperado |
| Servidor local + backend | APROBADA | Puertos temporales 15173/13000: / y fallback SPA 200, /api/health proxy 200, asset faltante 404, API apagada 502; procesos cerrados |
| Excel seguimiento | APROBADA estructural | Generado con Python stdlib; ZIP íntegro y todos los XML parseados; apertura visual en Excel NO EJECUTADA |
| Carga/repetición fixtures | NO EJECUTADA | Requiere base local origenes_erp_qa configurada; idempotencia DB no demostrada |
| Login correcto, aislamiento de sucursal y CRUD DB | NO EJECUTADA | Requiere PostgreSQL QA; no se inventan respuestas |
| Ventas, compras, caja, nómina y flujo E2E | BLOQUEADA | Integración de módulos y UI; ver matriz y plan |
| Instalación desde otro equipo/clon limpio | NO EJECUTADA | No declarar portabilidad comprobada |
| IEEE final y fuentes legales | PENDIENTE | Borrador sin maquetar; autores/fuentes/ISR por verificar |

Durante la primera ejecución falló `npm --prefix backend exec -- prisma generate` porque npm exec no cambió el directorio al esquema. Se reemplazó por scripts npm run ejecutados en backend, se generó cliente y se repitió QA: las 7 comprobaciones pasaron. No se ocultó el fallo inicial ni se atribuyó a lógica de negocio.

Para reproducir, seguir despliegue-local.md y ejecutar `npm run db:generate`, `npm run qa:test`, `npm run build:frontend`, `npm --prefix frontend run lint`. Registrar commit propio con `git rev-parse HEAD` y conservar resultados sin secretos. La compilación por sí sola no valida requisitos académicos ni la interfaz completa.

## Ampliación QA — 2026-11-16

Base de esta ampliación: 70e34bc; misma rama, sin cambios iniciales pendientes. El historial ya muestra origin/feature/qa-documentacion-despliegue; esta sesión no hizo push. Se revisó el autor Andres070212: formato observado emoji + tipo(área): descripción breve. Se conserva la autoría configurada del usuario.

- `npm run qa:test`: APROBADA, 24 comprobaciones, 0 fallos. Incluye las 7 anteriores, 11 operaciones de inventario sin token y 4 escenarios adicionales de token/encabezado, con sus grupos contabilizados por node:test. No se accedió a PostgreSQL.
- `npm run qa:entorno`: salida 1 esperada por pendientes. Dependencias, cliente generado y frontend compilado presentes. Falta backend/.env y configuración frontend VITE_API_URL=/api. El script no lee secretos del backend ni comprueba conexión DB; comprueba la presencia de archivos y la variable pública del frontend.
- Consulta de servicios `Get-Service '*postgres*'`: no devolvió servicios en esta máquina; psql no encontrado en PATH. Esto no descarta otra instalación, contenedor o servidor externo. No se inició ni instaló PostgreSQL.
- Las pruebas de login válido, CRUD persistente, recetas, stocks por sucursal y repetición del fixture siguen NO EJECUTADAS hasta disponer de PostgreSQL QA y configuración. No se tocaron módulos de compañeros.

Siguiente paso: configurar exclusivamente origenes_erp_qa siguiendo la guía Windows, generar cliente, aplicar migraciones versionadas y ejecutar el fixture. Para configurar credenciales se necesita la configuración local del propietario; no se debe inventar acceso ni usar su base de trabajo.
