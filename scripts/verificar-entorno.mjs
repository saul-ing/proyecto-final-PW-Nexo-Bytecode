import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';

// Solo lectura. No imprime variables, credenciales ni tokens, ni inicia servicios.
const raiz = new URL('../', import.meta.url);
let pendientes = 0;
const comprobar = (nombre, listo, detalle) => {
  console.log(`${listo ? 'LISTO' : 'PENDIENTE'}: ${nombre}${detalle ? ` — ${detalle}` : ''}`);
  if (!listo) pendientes++;
};
async function existe(path) {
  try { await access(new URL(path, raiz), constants.R_OK); return true; }
  catch { return false; }
}
console.log(`Node ${process.version}; comprobación local de archivos, sin conexión a PostgreSQL.`);
comprobar('dependencias backend', await existe('backend/node_modules/@prisma/client/package.json'));
comprobar('dependencias frontend', await existe('frontend/node_modules/vite/package.json'));
comprobar('cliente Prisma generado', await existe('backend/node_modules/.prisma/client/index.js'));
comprobar('frontend compilado', await existe('frontend/dist/index.html'));
comprobar('configuración backend', await existe('backend/.env'), 'se comprueba presencia; no se leen secretos');
let frontendConfigurado = false;
if (await existe('frontend/.env')) {
  const texto = await readFile(new URL('frontend/.env', raiz), 'utf8');
  frontendConfigurado = /^VITE_API_URL\s*=\s*["']?\/api["']?\s*$/m.test(texto);
}
comprobar('frontend para proxy local', frontendConfigurado, 'VITE_API_URL=/api antes de compilar');
console.log('PENDIENTE MANUAL: PostgreSQL, migraciones, carga QA, integración y pruebas de negocio.');
console.log('Esta comprobación no certifica la instalación ni el contenido del build.');
process.exitCode = pendientes ? 1 : 0;
