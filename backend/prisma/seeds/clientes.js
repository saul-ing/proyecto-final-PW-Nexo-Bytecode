// Clientes con datos fiscales para emitir CCF desde el POS
const CLIENTES = [
  { nombre: 'Inversiones Cuscatlán S.A. de C.V.', nit: '0614-120315-101-1', nrc: '245871-3', giro: 'Servicios de consultoría', direccion: 'Col. Escalón, San Salvador', telefono: '2263-4400', email: 'compras@cuscatlan.sv' },
  { nombre: 'Hotel Brisas del Lago', nit: '0511-080809-102-6', nrc: '187654-2', giro: 'Hotelería', direccion: 'Lago de Coatepeque, Santa Ana', telefono: '2441-7788' },
  { nombre: 'Oficinas Tecnológicas S.A.', nit: '0614-030418-103-9', nrc: '301122-7', giro: 'Desarrollo de software', direccion: 'Antiguo Cuscatlán, La Libertad', telefono: '2510-9090' },
];

export async function seedClientes(prisma) {
  for (const cliente of CLIENTES) {
    await prisma.cliente.upsert({ where: { nit: cliente.nit }, update: {}, create: cliente });
  }
}
