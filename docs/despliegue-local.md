# Instalación y demostración local en Windows

Objetivo: una computadora local, sin hosting ni dominio. Servir frontend compilado y API en loopback. No hace falta Nginx/Apache: scripts/serve-local.mjs ofrece estáticos y proxy /api para esta demostración. No se presenta como servidor de publicación en internet.

Entorno evaluado: Windows, Node v24.21.0, npm 11.19.0. PostgreSQL debe instalarse y su versión registrarse con `psql --version`; no se declara probado todavía. Los lockfiles están versionados: usar npm ci por proyecto.

Desde PowerShell, para clon nuevo:

```powershell
git clone https://github.com/saul-ing/proyecto-final-PW-Nexo-Bytecode.git
cd proyecto-final-PW-Nexo-Bytecode
# Esta rama solo existe localmente hasta que su propietario decida publicarla.
# Para reproducir esta entrega, usar un checkout que contenga sus commits.
npm --prefix backend ci
npm --prefix frontend ci
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Crear mediante pgAdmin una base NUEVA llamada origenes_erp_qa y usuario local con permiso sobre ella. No borrar ni reutilizar bases existentes. Editar backend/.env: DATABASE_URL apuntando a esa base y JWT_SECRET aleatorio propio (no usar cambia_esto). Escapar caracteres especiales de la contraseña en URL. El .env permanece ignorado. Para preparar datos agregar QA_DEMO_PASSWORD con una contraseña ficticia de al menos 12 caracteres; no publicarla. Editar frontend/.env con VITE_API_URL=/api para compilación con proxy local.

```powershell
npm run db:generate
npm run db:deploy
npm run db:seed:qa
npm run qa:test
npm run build:frontend
```

La carga QA solo admite host local y nombre origenes_erp_qa. Crea dos sucursales, dos usuarios ficticios (qa.centro@example.test y qa.norte@example.test), 13 insumos, 12 elaborados con recetas, dos reventas y stocks/kardex iniciales. Conserva registros existentes; no restablece existencias ni contraseñas al repetir. Ejecuciones concurrentes del fixture no están soportadas. No carga facturas, compras ni planillas inventadas. No carga tablas ISR sin fuente validada.

Abrir dos terminales desde la raíz:

```powershell
# Terminal 1
npm run start:backend
# Terminal 2
npm run start:local
```

Abrir http://127.0.0.1:5173 y consultar http://127.0.0.1:5173/api/health. La página actual sigue siendo plantilla Vite; compilarla no confirma integración funcional. Health tampoco valida conexión DB. El proxy usa API_PORT=3000 y LOCAL_PORT=5173 por defecto; si cambia PORT del backend, ajustar API_PORT al mismo valor. Apagar con Ctrl+C en ambas terminales; no detener PostgreSQL si otras aplicaciones lo usan.

Para desarrollo usar VITE_API_URL=http://localhost:3000/api, reiniciar Vite y navegar mediante http://localhost:5173 (CORS actual). Para la demo compilada volver a /api y recompilar. No usar vite preview como solución de proxy: aquí el proxy está en el servidor local añadido.

Problemas: 502 = backend apagado/puerto distinto; Prisma no inicializado = prisma generate; P1001 = revisar servicio/host/puerto; autenticación DB = revisar usuario y URL; EADDRINUSE = cerrar solo proceso propio o cambiar puertos; módulo Reactstrap faltante al integrar pantallas = dependencia del equipo frontend. No ejecutar migrate reset, db push ni audit fix --force para resolver a ciegas.

Lista de comprobación: [ ] versión PostgreSQL y commit registrados; [ ] clon nuevo probado; [ ] .env sin secretos versionados; [ ] DB QA correcta; [ ] migraciones aplicadas; [ ] seed repetido sin duplicar; [ ] login y sucursales verificados; [ ] build y QA ejecutados; [ ] módulos integrados y casos P0 aprobados; [ ] saldos y stock verificados; [ ] Excel/manual/IEEE revisados; [ ] demo y apagado ensayados. Todos los elementos sin evidencia siguen pendientes.
