import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
// No se conecta a PostgreSQL: todas las peticiones terminan antes de consultar Prisma.
process.env.JWT_SECRET='qa-only-secret-never-use-in-deployment';
process.env.DATABASE_URL='postgresql://invalid:invalid@127.0.0.1:1/origenes_erp_qa';
const {default:app}=await import('../src/app.js');
test('contrato HTTP sin escrituras ni acceso a DB',async t=>{
 const server=app.listen(0,'127.0.0.1');
 await new Promise(resolve=>server.once('listening',resolve));
 t.after(()=>new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve())));
 const base=`http://127.0.0.1:${server.address().port}/api`;
 for(const [path,options,status] of [
  ['/health',{},200],['/no-existe',{},404],['/inventario/insumos',{},401],
  ['/auth/me',{headers:{Authorization:'Bearer invalido'}},401],
  ['/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'},400],
 ]){
  await t.test(`${path} → ${status}`,async()=>{
   const response=await fetch(base+path,options);
   assert.equal(response.status,status);
   const body=await response.json();assert.equal(body.ok,status===200);
   assert.equal(typeof body.message,'string');
  });
 }
});


test('inventario exige autenticación para cada operación', async t => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
  const base = `http://127.0.0.1:${server.address().port}/api/inventario`;
  const operaciones = [
    ['GET', '/insumos'], ['POST', '/insumos'], ['PUT', '/insumos/1'], ['DELETE', '/insumos/1'],
    ['GET', '/productos'], ['GET', '/productos/1'], ['POST', '/productos'],
    ['PUT', '/productos/1'], ['DELETE', '/productos/1'], ['PUT', '/productos/1/receta'],
    ['GET', '/alertas'],
  ];
  for (const [method, path] of operaciones) {
    await t.test(`${method} ${path} sin token devuelve 401`, async () => {
      const response = await fetch(base + path, { method });
      assert.equal(response.status, 401);
      assert.deepEqual(await response.json(), { ok: false, message: 'Token requerido' });
    });
  }
});

test('autenticación rechaza tokens expirados, alterados y formatos incorrectos', async t => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
  const base = `http://127.0.0.1:${server.address().port}/api/auth/me`;
  const payload = { id: 1, rol: 'ADMIN', sucursalId: 1 };
  const expirado = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: -1 });
  const otraFirma = jwt.sign(payload, 'otra-clave-exclusiva-de-pruebas');
  for (const [caso, authorization] of [
    ['expirado', `Bearer ${expirado}`], ['firma ajena', `Bearer ${otraFirma}`],
    ['sin token', 'Bearer'], ['esquema incorrecto', 'Basic credenciales-ficticias'],
  ]) {
    await t.test(caso, async () => {
      const response = await fetch(base, { headers: { Authorization: authorization } });
      assert.equal(response.status, 401);
      const body = await response.json();
      assert.equal(body.ok, false);
      assert.equal(typeof body.message, 'string');
      assert.equal('stack' in body, false);
      assert.equal('usuario' in body, false);
    });
  }
});
