import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sucursal = await prisma.sucursal.upsert({
    where: { id: 1 },
    update: {},
    create: { nombre: 'Casa Matriz', direccion: 'San Salvador' },
  });

  await prisma.usuario.upsert({
    where: { email: 'admin@origenes.sv' },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@origenes.sv',
      password: await bcrypt.hash('Admin123!', 10),
      rol: 'ADMIN',
      sucursalId: sucursal.id,
    },
  });

  console.log('Seed listo: admin@origenes.sv / Admin123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());