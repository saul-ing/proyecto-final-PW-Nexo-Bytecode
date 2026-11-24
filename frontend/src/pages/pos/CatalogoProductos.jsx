import Icono from '../../components/Icono';
import { dinero } from '../../utils/formato';
import { imagenProducto } from './imagenesProductos';

// Icono de cada categoría según su nombre
const ICONOS_CATEGORIA = [
  [/caliente|café|cafe|espresso/i, 'local_cafe'],
  [/fría|fria|frapp|cold|helad/i, 'ac_unit'],
  [/panader|postre|pastel|dulce/i, 'bakery_dining'],
  [/reventa|empaca|snack/i, 'shopping_bag'],
];

const iconoCategoria = (nombre = '') =>
  ICONOS_CATEGORIA.find(([patron]) => patron.test(nombre))?.[1] ?? 'restaurant_menu';

function BotonCategoria({ activa, onClick, icono, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition ' +
        (activa
          ? 'border-origen-700 bg-origen-700 text-white'
          : 'border-gray-200 bg-white text-origen-700 hover:bg-origen-100')
      }
    >
      <Icono nombre={icono} tamano={18} />
      {children}
    </button>
  );
}

function CatalogoProductos({
  productos,
  categorias,
  categoriaId,
  onCategoria,
  buscar,
  onBuscar,
  items = [],
  onAgregar,
  onCambiarCantidad = () => {},
}) {
  // Cantidad que ya hay en el carrito de cada producto
  const cantidades = Object.fromEntries(items.map((i) => [i.productoId, i.cantidad]));

  return (
    <div>
      <div className="relative">
        <Icono nombre="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-origen-500" />
        <input
          type="search"
          placeholder="Buscar producto..."
          value={buscar}
          onChange={(e) => onBuscar(e.target.value)}
          className="w-full rounded-full border border-gray-200 py-2.5 pl-10 pr-4 focus:border-origen-700 focus:outline-none focus:ring-2 focus:ring-origen-500"
        />
      </div>

      <div className="my-4 flex flex-wrap gap-2">
        <BotonCategoria activa={categoriaId === null} onClick={() => onCategoria(null)} icono="apps">
          Todo el menú
        </BotonCategoria>
        {categorias.map((c) => (
          <BotonCategoria
            key={c.id}
            activa={categoriaId === c.id}
            onClick={() => onCategoria(c.id)}
            icono={iconoCategoria(c.nombre)}
          >
            {c.nombre}
          </BotonCategoria>
        ))}
      </div>

      {productos.length === 0 ? (
        <p className="py-10 text-center text-gray-500">No hay productos para mostrar.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {productos.map((p) => {
            const agotado = p.disponibles < 1;
            const bajo = !agotado && p.disponibles <= 5;
            const cantidad = cantidades[p.id] ?? 0;
            const imagen = imagenProducto(p.nombre);

            return (
              <div
                key={p.id}
                className={
                  'flex flex-col rounded-2xl border p-3 transition ' +
                  (cantidad > 0 ? 'border-origen-700 bg-origen-100/60' : 'border-gray-200 bg-white') +
                  (agotado ? ' opacity-50' : '')
                }
              >
                {/* Foto del producto; si no tiene, queda el icono de su categoría */}
                <div className="mb-3 flex h-32 items-center justify-center overflow-hidden rounded-xl bg-origen-100 text-origen-500">
                  {imagen ? (
                    <img src={imagen} alt={p.nombre} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <Icono nombre={iconoCategoria(p.categoria)} tamano={44} />
                  )}
                </div>

                <h3 className="font-semibold text-origen-950">{p.nombre}</h3>
                <p className="text-sm text-gray-500">{dinero(p.precio)}</p>
                <p className={'mt-1 text-xs ' + (agotado ? 'text-red-700' : bajo ? 'text-orange-700' : 'text-origen-500')}>
                  {agotado ? 'Agotado' : `${p.disponibles} disponibles`}
                </p>

                <div className="mt-3">
                  {cantidad === 0 ? (
                    <button
                      type="button"
                      disabled={agotado}
                      onClick={() => onAgregar(p)}
                      className="flex w-full items-center justify-center gap-1 rounded-full border border-origen-700 py-1.5 text-sm font-medium text-origen-700 transition hover:bg-origen-700 hover:text-white disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-origen-700"
                    >
                      Agregar
                      <Icono nombre="add_circle" tamano={18} />
                    </button>
                  ) : (
                    <div className="flex items-center justify-between rounded-full bg-origen-700 p-1 text-white">
                      <button
                        type="button"
                        onClick={() => onCambiarCantidad(p.id, -1)}
                        aria-label={`Quitar uno de ${p.nombre}`}
                        className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/20"
                      >
                        <Icono nombre="remove" tamano={18} />
                      </button>
                      <span className="font-semibold">{cantidad}</span>
                      <button
                        type="button"
                        onClick={() => onCambiarCantidad(p.id, 1)}
                        disabled={cantidad >= p.disponibles}
                        aria-label={`Agregar uno de ${p.nombre}`}
                        className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/20 disabled:opacity-40"
                      >
                        <Icono nombre="add" tamano={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CatalogoProductos;