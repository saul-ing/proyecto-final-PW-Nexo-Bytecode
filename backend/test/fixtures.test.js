import test from 'node:test';
import assert from 'node:assert/strict';
import {insumos,productos,reventa} from '../prisma/fixtures-qa.js';
test('catálogo QA tiene 12 elaborados, recetas consistentes y reventa en unidades',()=>{
  assert.equal(productos.length,12);
  const catalogo=new Map(insumos.map(i=>[i[0],i]));
  assert.equal(catalogo.size,insumos.length);
  assert.equal(new Set(productos.map(p=>p.nombre)).size,productos.length);
  for(const p of productos){
    assert.ok(p.precio>0 && p.receta.length>0);
    assert.equal(new Set(p.receta.map(l=>l[0])).size,p.receta.length);
    for(const [nombre,cantidad] of p.receta){assert.ok(catalogo.has(nombre));assert.ok(cantidad>0);}
  }
  for(const [,precio,nombre] of reventa){assert.ok(precio>0);assert.equal(catalogo.get(nombre)[1],'UNIDAD');}
  const latte=productos.find(p=>p.nombre==='QA Latte Grande');
  assert.equal(latte.receta.find(l=>l[0]==='Café especialidad')[1],18);
  assert.equal(latte.receta.find(l=>l[0]==='Leche')[1],250);
});
