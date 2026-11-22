// Categorías, insumos con stock por sucursal, productos y recetas

const CATEGORIAS = ['Bebidas calientes', 'Bebidas frías', 'Repostería y comida', 'Empacados'];

// [nombre, unidad, costo por unidad, stock inicial, stock mínimo]
const INSUMOS = [
  ['Café de especialidad', 'G', 0.025, 5000, 1000],
  ['Leche entera', 'ML', 0.0012, 20000, 4000],
  ['Leche de almendra', 'ML', 0.003, 1500, 2000], // empieza bajo el mínimo para ver la alerta
  ['Chocolate en polvo', 'G', 0.015, 3000, 500],
  ['Jarabe de vainilla', 'ML', 0.01, 2000, 400],
  ['Jarabe de caramelo', 'ML', 0.01, 2000, 400],
  ['Té chai', 'G', 0.04, 1000, 200],
  ['Hielo', 'G', 0.0005, 20000, 5000],
  ['Crema batida', 'G', 0.012, 2000, 400],
  ['Harina de trigo', 'G', 0.002, 10000, 2000],
  ['Mantequilla', 'G', 0.01, 4000, 800],
  ['Huevo', 'UNIDAD', 0.15, 200, 50],
  ['Azúcar', 'G', 0.0015, 8000, 1500],
  ['Pan para sándwich', 'UNIDAD', 0.25, 100, 30],
  ['Jamón', 'G', 0.012, 3000, 600],
  ['Queso', 'G', 0.014, 3000, 600],
  ['Vaso 12oz', 'UNIDAD', 0.08, 300, 100],
  ['Vaso 16oz', 'UNIDAD', 0.1, 300, 100],
  ['Tapadera', 'UNIDAD', 0.04, 600, 150],
  ['Viñeta', 'UNIDAD', 0.02, 600, 150],
  ['Pajilla', 'UNIDAD', 0.01, 400, 100],
  ['Plato desechable', 'UNIDAD', 0.05, 300, 80],
  // Artículos de reventa (se venden tal cual)
  ['Agua embotellada 600ml', 'UNIDAD', 0.3, 100, 24],
  ['Galletas artesanales empacadas', 'UNIDAD', 0.6, 60, 15],
  ['Café molido Orígenes 340g', 'UNIDAD', 4.5, 40, 10],
  ['Jugo natural embotellado', 'UNIDAD', 0.7, 60, 15],
];

// Vaso, tapa y viñeta que lleva toda bebida para llevar
const PARA_LLEVAR_12 = { 'Vaso 12oz': 1, Tapadera: 1, Viñeta: 1 };
const PARA_LLEVAR_16 = { 'Vaso 16oz': 1, Tapadera: 1, Viñeta: 1 };

// [nombre, categoría, precio con IVA, receta { insumo: cantidad }]
const ELABORADOS = [
  // Ejemplo del enunciado: 18g café, 250ml leche, vaso 16oz, tapadera y viñeta
  ['Latte Grande', 'Bebidas calientes', 3.5, { 'Café de especialidad': 18, 'Leche entera': 250, ...PARA_LLEVAR_16 }],
  ['Latte Mediano', 'Bebidas calientes', 3.0, { 'Café de especialidad': 18, 'Leche entera': 180, ...PARA_LLEVAR_12 }],
  ['Americano', 'Bebidas calientes', 2.25, { 'Café de especialidad': 18, ...PARA_LLEVAR_12 }],
  ['Espresso doble', 'Bebidas calientes', 2.0, { 'Café de especialidad': 18, 'Vaso 12oz': 1 }],
  ['Cappuccino', 'Bebidas calientes', 3.25, { 'Café de especialidad': 18, 'Leche entera': 150, ...PARA_LLEVAR_12 }],
  ['Mocha', 'Bebidas calientes', 3.75, { 'Café de especialidad': 18, 'Leche entera': 200, 'Chocolate en polvo': 20, 'Crema batida': 15, ...PARA_LLEVAR_16 }],
  ['Caramel Macchiato', 'Bebidas calientes', 3.95, { 'Café de especialidad': 18, 'Leche entera': 220, 'Jarabe de caramelo': 20, ...PARA_LLEVAR_16 }],
  ['Latte de vainilla con almendra', 'Bebidas calientes', 4.25, { 'Café de especialidad': 18, 'Leche de almendra': 250, 'Jarabe de vainilla': 20, ...PARA_LLEVAR_16 }],
  ['Chai Latte', 'Bebidas calientes', 3.5, { 'Té chai': 15, 'Leche entera': 220, ...PARA_LLEVAR_16 }],
  ['Chocolate caliente', 'Bebidas calientes', 2.95, { 'Chocolate en polvo': 30, 'Leche entera': 250, ...PARA_LLEVAR_12 }],
  ['Frappé de café', 'Bebidas frías', 4.25, { 'Café de especialidad': 18, 'Leche entera': 150, Hielo: 200, 'Crema batida': 20, 'Jarabe de caramelo': 15, 'Vaso 16oz': 1, Tapadera: 1, Pajilla: 1 }],
  ['Cold Brew', 'Bebidas frías', 3.25, { 'Café de especialidad': 25, Hielo: 150, 'Vaso 16oz': 1, Tapadera: 1, Pajilla: 1 }],
  ['Croissant de mantequilla', 'Repostería y comida', 2.25, { 'Harina de trigo': 60, Mantequilla: 30, Huevo: 1, 'Plato desechable': 1 }],
  ['Sándwich de jamón y queso', 'Repostería y comida', 3.95, { 'Pan para sándwich': 1, Jamón: 60, Queso: 40, Mantequilla: 10, 'Plato desechable': 1 }],
  ['Panqueques con miel', 'Repostería y comida', 4.5, { 'Harina de trigo': 120, Huevo: 2, 'Leche entera': 150, Azúcar: 20, Mantequilla: 15, 'Plato desechable': 1 }],
];

// [nombre, precio con IVA, insumo que descuenta]
const REVENTA = [
  ['Agua embotellada', 1.0, 'Agua embotellada 600ml'],
  ['Galletas artesanales', 1.75, 'Galletas artesanales empacadas'],
  ['Café molido Orígenes 340g', 9.95, 'Café molido Orígenes 340g'],
  ['Jugo natural', 1.5, 'Jugo natural embotellado'],
];

// Producto no tiene nombre único: se busca antes de crear
async function buscarOCrearProducto(prisma, data) {
  const existente = await prisma.producto.findFirst({ where: { nombre: data.nombre } });
  return existente ?? prisma.producto.create({ data });
}

export async function seedInventario(prisma, sucursales) {
  const categorias = {};
  for (const nombre of CATEGORIAS) {
    const c = await prisma.categoria.upsert({ where: { nombre }, update: {}, create: { nombre } });
    categorias[nombre] = c.id;
  }

  const insumos = {};
  for (const [nombre, unidad, costoUnitario, cantidad, stockMinimo] of INSUMOS) {
    const insumo = await prisma.insumo.upsert({ where: { nombre }, update: {}, create: { nombre, unidad, costoUnitario } });
    insumos[nombre] = insumo.id;

    // El stock inicial solo se crea una vez y queda en el kárdex como ajuste
    for (const s of sucursales) {
      const clave = { insumoId_sucursalId: { insumoId: insumo.id, sucursalId: s.id } };
      if (await prisma.stockSucursal.findUnique({ where: clave })) continue;
      await prisma.stockSucursal.create({ data: { insumoId: insumo.id, sucursalId: s.id, cantidad, stockMinimo } });
      await prisma.movimientoInventario.create({
        data: { tipo: 'AJUSTE', cantidad, referencia: 'SEED:stock inicial', insumoId: insumo.id, sucursalId: s.id },
      });
    }
  }

  for (const [nombre, categoria, precio, receta] of ELABORADOS) {
    const producto = await buscarOCrearProducto(prisma, {
      nombre, tipo: 'ELABORADO', precio, categoriaId: categorias[categoria],
    });
    for (const [insumo, cantidad] of Object.entries(receta)) {
      await prisma.recetaItem.upsert({
        where: { productoId_insumoId: { productoId: producto.id, insumoId: insumos[insumo] } },
        update: {},
        create: { productoId: producto.id, insumoId: insumos[insumo], cantidad },
      });
    }
  }

  for (const [nombre, precio, insumo] of REVENTA) {
    await buscarOCrearProducto(prisma, {
      nombre, tipo: 'REVENTA', precio, categoriaId: categorias.Empacados, insumoReventaId: insumos[insumo],
    });
  }

  return { insumos };
}
