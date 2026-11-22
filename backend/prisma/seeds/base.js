import bcrypt from 'bcryptjs';

// Sucursales extra (Casa Matriz es la id 1)
const SUCURSALES = [
  { nombre: 'Santa Tecla', direccion: 'Paseo El Carmen, Santa Tecla', telefono: '2228-1100' },
  { nombre: 'San Miguel', direccion: 'Av. Roosevelt Sur, San Miguel', telefono: '2661-2200' },
];

// Un usuario por rol para probar los permisos
const USUARIOS = [
  { nombre: 'Administrador', email: 'admin@origenes.sv', clave: 'Admin123!', rol: 'ADMIN' },
  { nombre: 'Gerente Casa Matriz', email: 'gerente@origenes.sv', clave: 'Gerente123!', rol: 'GERENTE' },
  { nombre: 'Cajero Casa Matriz', email: 'cajero@origenes.sv', clave: 'Cajero123!', rol: 'CAJERO' },
  { nombre: 'Barista Casa Matriz', email: 'barista@origenes.sv', clave: 'Barista123!', rol: 'BARISTA' },
];

// Sucursales y usuarios del sistema
export async function seedBase(prisma) {
  const casaMatriz = await prisma.sucursal.upsert({
    where: { id: 1 },
    update: {},
    create: { nombre: 'Casa Matriz', direccion: 'San Salvador', telefono: '2222-0000' },
  });

  // Sucursal no tiene nombre único: se busca antes de crear
  const sucursales = [casaMatriz];
  for (const datos of SUCURSALES) {
    const existente = await prisma.sucursal.findFirst({ where: { nombre: datos.nombre } });
    sucursales.push(existente ?? (await prisma.sucursal.create({ data: datos })));
  }

  for (const u of USUARIOS) {
    await prisma.usuario.upsert({
      where: { email: u.email },
      update: {},
      create: {
        nombre: u.nombre,
        email: u.email,
        password: await bcrypt.hash(u.clave, 10),
        rol: u.rol,
        sucursalId: casaMatriz.id,
      },
    });
  }

  return { sucursales };
}
