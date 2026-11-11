# Orígenes SV · ERP y POS

Proyecto de Cátedra · Programación Web · Ciclo 02, 2026.
Stack: React + Vite + Tailwind · Node + Express · PostgreSQL + Prisma

## Puesta en marcha

    git clone <url-del-repo>
    cd origenes-sv-erp
    git checkout develop
    npm run install:all
    cp backend/.env.example backend/.env
    cp frontend/.env.example frontend/.env
    npm run db:migrate
    npm run db:seed
    npm run dev:backend
    npm run dev:frontend

Antes de migrar: crear la base `origenes_erp` en PostgreSQL y poner tu contraseña en backend/.env.

## Git Flow

- main: estable. develop: integración.
- feature/nombre-del-modulo: una por persona, sale de develop y vuelve por Pull Request.
- Nadie hace push directo a main ni a develop.
- Commits con prefijo: feat:, fix:, docs:, refactor:, chore:
