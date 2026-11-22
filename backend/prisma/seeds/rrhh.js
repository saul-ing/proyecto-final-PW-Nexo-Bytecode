// [nombre, dui, cargo, salario mensual, índice de sucursal, email del usuario que lo representa]
const EMPLEADOS = [
  ['María José Hernández', '04567891-2', 'Gerente', 950, 0, 'gerente@origenes.sv'],
  ['Carlos Alberto Rivas', '05678912-3', 'Cajero', 450, 0, 'cajero@origenes.sv'],
  ['Ana Sofía Martínez', '06789123-4', 'Barista', 420, 0, 'barista@origenes.sv'],
  ['José Luis Portillo', '07891234-5', 'Barista', 420, 0, null],
  ['Gabriela Fuentes', '08912345-6', 'Gerente', 900, 1, null],
  ['Diego Alejandro Cruz', '09123456-7', 'Cajero', 450, 1, null],
  ['Fernanda Méndez', '01234567-8', 'Barista', 400, 2, null],
  ['Ricardo Ayala', '02345678-9', 'Cajero', 450, 2, null],
];

// Tabla de retención de renta quincenal
async function seedTramosRenta(prisma) {
  if ((await prisma.tramoRenta.count()) > 0) return;
  await prisma.tramoRenta.createMany({
    data: [
      { desde: 0.01, hasta: 275.0, porcentaje: 0, sobreExceso: 0, cuotaFija: 0 },
      { desde: 275.01, hasta: 447.62, porcentaje: 10, sobreExceso: 275.0, cuotaFija: 8.83 },
      { desde: 447.63, hasta: 1019.05, porcentaje: 20, sobreExceso: 447.62, cuotaFija: 30.0 },
      { desde: 1019.06, hasta: null, porcentaje: 30, sobreExceso: 1019.05, cuotaFija: 144.28 },
    ],
  });
}

export async function seedRrhh(prisma, sucursales) {
  await seedTramosRenta(prisma);

  for (const [nombre, dui, cargo, salarioMensual, indice, email] of EMPLEADOS) {
    const numero = dui.replace('-', '');
    const empleado = await prisma.empleado.upsert({
      where: { dui },
      update: {},
      create: {
        nombre, dui, cargo, salarioMensual,
        numeroIsss: numero.slice(0, 9),
        numeroAfp: `1${numero}`,
        fechaIngreso: new Date('2025-03-01'),
        sucursalId: sucursales[indice].id,
      },
    });

    // Enlaza el usuario de prueba con su ficha de empleado
    if (email) {
      await prisma.usuario.update({ where: { email }, data: { empleadoId: empleado.id } });
    }
  }
}
