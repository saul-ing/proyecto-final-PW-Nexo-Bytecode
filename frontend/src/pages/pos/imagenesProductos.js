// Vite carga todas las imágenes de la carpeta y devuelve su URL
const archivos = import.meta.glob('../../assets/productos/*.jpg', { eager: true, import: 'default' });

// Nombre del producto (como está en la base) -> nombre del archivo
const ARCHIVO_POR_PRODUCTO = {
  'Latte Grande': 'latte-grande',
  'Latte Mediano': 'latte-mediano',
  Americano: 'americano',
  'Espresso doble': 'espresso-doble',
  Cappuccino: 'cappuccino',
  Mocha: 'mocha',
  'Caramel Macchiato': 'caramel-macchiato',
  'Latte de vainilla con almendra': 'latte-vainilla-almendra',
  'Chai Latte': 'chai-latte',
  'Chocolate caliente': 'chocolate-caliente',
  'Frappé de café': 'frappe-cafe',
  'Cold Brew': 'cold-brew',
  'Croissant de mantequilla': 'croissant',
  'Sándwich de jamón y queso': 'sandwich-jamon-queso',
  'Panqueques con miel': 'panqueques-miel',
  'Agua embotellada': 'agua-embotellada',
  'Galletas artesanales': 'galletas-artesanales',
  'Café molido Orígenes 340g': 'cafe-molido-340g',
  'Jugo natural': 'jugo-natural',
};

// Devuelve la URL de la imagen o null si el producto no tiene (ej. uno creado después)
export function imagenProducto(nombre) {
  const archivo = ARCHIVO_POR_PRODUCTO[nombre];
  return archivo ? archivos[`../../assets/productos/${archivo}.jpg`] ?? null : null;
}
