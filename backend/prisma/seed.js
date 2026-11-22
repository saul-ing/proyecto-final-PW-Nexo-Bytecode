import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { seedBase } from './seeds/base.js';
import { seedInventario } from './seeds/inventario.js';
import { seedRrhh } from './seeds/rrhh.js';

const prisma = new PrismaClient();

// El orden importa: cada módulo usa datos de los anteriores
async function main() {
  const { sucursales } = await seedBase(prisma);
  const { insumos } = await seedInventario(prisma, sucursales);
  await seedRrhh(prisma, sucursales);

  console.log('Seed listo. Usuarios: admin, gerente, cajero y barista @origenes.sv (ver prisma/seeds/base.js)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
