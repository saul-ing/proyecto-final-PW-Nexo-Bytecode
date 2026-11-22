// Tabla de retención de renta quincenal
export async function seedRrhh(prisma) {
  if ((await prisma.tramoRenta.count()) === 0) {
    await prisma.tramoRenta.createMany({
      data: [
        { desde: 0.01, hasta: 275.0, porcentaje: 0, sobreExceso: 0, cuotaFija: 0 },
        { desde: 275.01, hasta: 447.62, porcentaje: 10, sobreExceso: 275.0, cuotaFija: 8.83 },
        { desde: 447.63, hasta: 1019.05, porcentaje: 20, sobreExceso: 447.62, cuotaFija: 30.0 },
        { desde: 1019.06, hasta: null, porcentaje: 30, sobreExceso: 1019.05, cuotaFija: 144.28 },
      ],
    });
  }
}
