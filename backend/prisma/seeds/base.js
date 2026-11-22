import bcrypt from 'bcryptjs';

// Sucursales y usuarios del sistema
export async function seedBase(prisma) {
  const casaMatriz = await prisma.sucursal.upsert({
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
      sucursalId: casaMatriz.id,
    },
  });

  return { sucursales: [casaMatriz] };
}
