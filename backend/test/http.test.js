import test from 'node:test';
import assert from 'node:assert/strict';
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
