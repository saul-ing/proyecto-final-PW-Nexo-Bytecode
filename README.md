# Orígenes SV · ERP y POS

Proyecto de Cátedra, Programación Web, Ciclo 02, 2026. React/Vite/Tailwind, Express, PostgreSQL y Prisma.

## Estado del código

Base revisada: develop 7c53311. API de autenticación e inventario integrada; frontend App.jsx aún plantilla. Las pantallas inventario existen sin montar y requieren resolver Reactstrap. Ventas, compras, caja y RRHH no están montados en esta base; hay trabajo del equipo en ramas separadas. No se afirma que el sistema completo esté listo.

## Instalación

Seguir [guía Windows](docs/despliegue-local.md) para clon, PostgreSQL, variables, migraciones no destructivas, fixtures y arranque. Node evaluado: 24.21.0; npm: 11.19.0. No subir .env ni usar datos reales en pruebas.

```powershell
npm --prefix backend ci
npm --prefix frontend ci
# Configurar .env y base QA según la guía antes de continuar.
npm run db:generate
npm run db:deploy
npm run db:seed:qa
npm run qa:test
npm run build:frontend
# En terminales separadas:
npm run start:backend
npm run start:local
```

## Documentación

- [Matriz del PDF](docs/qa/matriz-requisitos.md) y [plan de pruebas](docs/qa/plan-pruebas.md).
- [Arquitectura](docs/arquitectura.md), [API](docs/api.md) y [base de datos](docs/db.md).
- [Manual parcial](docs/manual-usuario.md), [incidencias](docs/qa/incidencias.md) y [verificaciones](docs/qa/verificacion.md).
- [Borrador IEEE](docs/ieee/borrador.md) y seguimiento en docs/qa/seguimiento.xlsx (generable con scripts/generar-seguimiento.py).

## Gitflow del equipo

main: estable; develop: integración; feature/nombre: trabajo desde develop y revisión por Pull Request. No hacer push directo a main/develop. Esta entrega usa feature/qa-documentacion-despliegue y commits coherentes con emojis, por ejemplo `📝 docs(qa): matriz y plan de pruebas`. No se integran ramas ajenas ni se publica sin instrucción. Los commits deben representar trabajo real.

QA/documentación/despliegue es un acuerdo del equipo comunicado por el usuario. Los requisitos académicos están identificados con páginas del PDF. Las decisiones técnicas no se presentan como obligaciones académicas. Consultar declaración de IA en el borrador IEEE y revisar/comprender los cambios antes de la defensa.
