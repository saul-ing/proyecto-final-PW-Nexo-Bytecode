# Despliegue local en Windows

Guía para el código integrado de `develop` en `3575d81`. Se requieren Node.js, npm y una instancia local de PostgreSQL 18, que fue la versión usada para la verificación. Ejecuta estos comandos desde la raíz de un clon de la aplicación.

1. Enciende PostgreSQL y crea una base nueva llamada `origenes_erp` con un usuario que pueda crear y modificar tablas. Usa una base desechable para la demostración.
2. Instala dependencias y prepara los archivos de entorno.

   ```powershell
   npm.cmd --prefix backend ci
   npm.cmd --prefix frontend ci
   Copy-Item backend/.env.example backend/.env
   Copy-Item frontend/.env.example frontend/.env
   ```

3. En `backend/.env`, ajusta `DATABASE_URL` con el usuario, la contraseña, el host y la base local. Define un `JWT_SECRET` local y deja `PORT=3000`. En `frontend/.env`, usa `VITE_API_URL=http://localhost:3000/api`.
4. Genera el cliente Prisma y aplica las migraciones versionadas. Luego carga el seed principal.

   ```powershell
   Push-Location backend
   try {
       npx.cmd prisma generate
       npx.cmd prisma migrate deploy
       npm.cmd run db:seed
   } finally {
       Pop-Location
   }
   ```

5. Ejecuta `npm.cmd run dev:backend` y `npm.cmd run dev:frontend` en terminales separadas. Abre `http://localhost:5173` y usa una [cuenta de demostración](manual-usuario.md#cuentas-de-demostración). La API responde en `http://localhost:3000/api/health`.

El seed carga sucursales, usuarios, insumos con existencias, productos y recetas, clientes, proveedores, compras de ejemplo, cuentas por pagar, empleados y tramos de renta. Caja, ventas y planillas se generan al operar la aplicación. Al terminar la demostración, detén ambos procesos con Ctrl+C.

Para comprobar el paquete de producción del frontend, ejecuta `npm.cmd --prefix frontend run build`. El resultado queda en `frontend/dist`. Si se publica en otro origen, se debe configurar la URL de la API, el origen permitido por Express y el fallback de las rutas de la aplicación.
