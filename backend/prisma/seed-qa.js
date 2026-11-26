import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { insumos, productos, reventa } from './fixtures-qa.js';

// Barrera de destino antes de abrir conexión o escribir.
const url = new URL(process.env.DATABASE_URL || 'postgresql://invalid/invalid');
if (!['localhost','127.0.0.1','[::1]'].includes(url.hostname) || url.pathname !== '/origenes_erp_qa') {
  throw new Error('El fixture solo permite PostgreSQL local /origenes_erp_qa');
}
if (!process.env.QA_DEMO_PASSWORD || process.env.QA_DEMO_PASSWORD.length < 12) {
  throw new Error('Define QA_DEMO_PASSWORD de al menos 12 caracteres; cuenta ficticia de pruebas');
}
const prisma = new PrismaClient();
try {
  const password = await bcrypt.hash(process.env.QA_DEMO_PASSWORD,10);
  await prisma.$transaction(async tx => {
    const categoria = await tx.categoria.upsert({where:{nombre:'QA Bebidas y reventa'},update:{},create:{nombre:'QA Bebidas y reventa'}});
    for (const nombre of ['QA Centro','QA Norte']) {
      const sucursal = await tx.sucursal.findFirst({where:{nombre}}) || await tx.sucursal.create({data:{nombre,direccion:'Ubicación ficticia de pruebas'}});
      await tx.usuario.upsert({where:{email:nombre==='QA Centro'?'qa.centro@example.test':'qa.norte@example.test'},update:{},create:{nombre:'Usuario ficticio QA',email:nombre==='QA Centro'?'qa.centro@example.test':'qa.norte@example.test',password,rol:'ADMIN',sucursalId:sucursal.id}});
      for (const [base,unidad,costoUnitario,cantidad,stockMinimo] of insumos) {
        const insumo = await tx.insumo.upsert({where:{nombre:`QA ${base}`},update:{},create:{nombre:`QA ${base}`,unidad,costoUnitario}});
        const key = {insumoId:insumo.id,sucursalId:sucursal.id};
        const existe = await tx.stockSucursal.findUnique({where:{insumoId_sucursalId:key}});
        if (!existe) {
          const inicial = nombre==='QA Norte'?cantidad/2:cantidad;
          await tx.stockSucursal.create({data:{...key,cantidad:inicial,stockMinimo}});
          await tx.movimientoInventario.create({data:{...key,tipo:'AJUSTE',cantidad:inicial,referencia:'QA_STOCK_INICIAL'}});
        }
      }
    }
    for (const p of productos) {
      const existe = await tx.producto.findFirst({where:{nombre:p.nombre}});
      if (existe) continue; // Conserva receta/precio preexistentes; no sobrescribe.
      const lineas=[];
      for (const [nombre,cantidad] of p.receta) {
        const insumo=await tx.insumo.findUniqueOrThrow({where:{nombre:`QA ${nombre}`}});
        lineas.push({insumoId:insumo.id,cantidad});
      }
      await tx.producto.create({data:{nombre:p.nombre,tipo:'ELABORADO',precio:p.precio,categoriaId:categoria.id,receta:{create:lineas}}});
    }
    for (const [nombre,precio,base] of reventa) {
      if (await tx.producto.findFirst({where:{nombre}})) continue;
      const insumo=await tx.insumo.findUniqueOrThrow({where:{nombre:`QA ${base}`}});
      await tx.producto.create({data:{nombre,precio,tipo:'REVENTA',categoriaId:categoria.id,insumoReventaId:insumo.id}});
    }
  }, {timeout:30000});
  console.log('Fixture QA terminado sin actualizar registros existentes. No equivale a validar flujos de negocio.');
} finally {
  await prisma.$disconnect();
}
