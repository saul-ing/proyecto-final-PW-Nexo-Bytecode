import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { seedBase } from './seeds/base.js';
import { seedRrhh } from './seeds/rrhh.js';

const prisma = new PrismaClient();

// El orden importa: cada módulo usa datos de los anteriores
async function main() {
  const { sucursales } = await seedBase(prisma);
  await seedRrhh(prisma, sucursales);

  console.log('Seed listo: admin@origenes.sv / Admin123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
