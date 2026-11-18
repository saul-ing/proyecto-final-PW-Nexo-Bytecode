import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sucursal = await prisma.sucursal.upsert({
    where: { id: 1 },
    update: {},
    create: { nombre: 'Casa Matriz', direccion: 'San Salvador' },
  });

  if ((await prisma.tramoRenta.count()) === 0) {
  await prisma.tramoRenta.createMany({ data: [
    { desde: 0.01,    hasta: 275.00,  porcentaje: 0,  sobreExceso: 0,       cuotaFija: 0 },
    { desde: 275.01,  hasta: 447.62,  porcentaje: 10, sobreExceso: 275.00,  cuotaFija: 8.83 },
    { desde: 447.63,  hasta: 1019.05, porcentaje: 20, sobreExceso: 447.62,  cuotaFija: 30.00 },
    { desde: 1019.06, hasta: null,    porcentaje: 30, sobreExceso: 1019.05, cuotaFija: 144.28 },
  ]});
}

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