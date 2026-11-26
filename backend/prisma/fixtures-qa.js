// Datos ficticios; cantidades por unidad de producto, sin conversiones implícitas.
export const insumos = [
  ['Café especialidad','G',0.025,5000,500], ['Leche','ML',0.0015,20000,1000],
  ['Agua','ML',0.0001,30000,1000], ['Chocolate','G',0.012,2000,100],
  ['Vainilla','ML',0.008,1000,100], ['Caramelo','ML',0.008,1000,100],
  ['Vaso 16oz','UNIDAD',0.12,200,20], ['Tapadera','UNIDAD',0.04,200,20],
  ['Viñeta','UNIDAD',0.01,200,20], ['Té','G',0.02,500,50],
  ['Azúcar','G',0.002,2000,100], ['Agua embotellada','UNIDAD',0.35,24,5],
  ['Galleta empacada','UNIDAD',0.40,5,5],
];
const envase = [['Vaso 16oz',1],['Tapadera',1],['Viñeta',1]];
export const productos = [
  ['Espresso',1.50,[['Café especialidad',18],['Agua',40]]],
  ['Americano',2.00,[['Café especialidad',18],['Agua',250]]],
  ['Latte Grande',3.50,[['Café especialidad',18],['Leche',250]]],
  ['Cappuccino',3.25,[['Café especialidad',18],['Leche',180]]],
  ['Mocha',3.75,[['Café especialidad',18],['Leche',220],['Chocolate',20]]],
  ['Latte Vainilla',3.75,[['Café especialidad',18],['Leche',250],['Vainilla',15]]],
  ['Latte Caramelo',3.75,[['Café especialidad',18],['Leche',250],['Caramelo',15]]],
  ['Chocolate Caliente',3.00,[['Leche',250],['Chocolate',30]]],
  ['Té Negro',2.00,[['Té',3],['Agua',250]]],
  ['Té con Leche',2.75,[['Té',3],['Agua',100],['Leche',150]]],
  ['Café Dulce',2.25,[['Café especialidad',18],['Agua',200],['Azúcar',10]]],
  ['Leche Vainilla',2.50,[['Leche',250],['Vainilla',15]]],
].map(([nombre,precio,receta]) => ({nombre:`QA ${nombre}`,precio,receta:[...receta,...envase]}));
export const reventa = [['QA Agua embotellada',1.00,'Agua embotellada'],['QA Galleta empacada',1.25,'Galleta empacada']];
