import { dinero } from '../../utils/formato';

const inputClase =
  'w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600';

function BotonCategoria({ activa, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'rounded-full border px-3 py-1 text-sm ' +
        (activa
          ? 'border-amber-700 bg-amber-700 text-white'
          : 'border-gray-300 text-gray-700 hover:bg-gray-100')
      }
    >
      {children}
    </button>
  );
}

function CatalogoProductos({ productos, categorias, categoriaId, onCategoria, buscar, onBuscar, onAgregar }) {
  return (
    <div>
      <input
        type="search"
        placeholder="Buscar producto..."
        value={buscar}
        onChange={(e) => onBuscar(e.target.value)}
        className={inputClase}
      />

      <div className="my-3 flex flex-wrap gap-2">
        <BotonCategoria activa={categoriaId === null} onClick={() => onCategoria(null)}>
          Todos
        </BotonCategoria>
        {categorias.map((c) => (
          <BotonCategoria key={c.id} activa={categoriaId === c.id} onClick={() => onCategoria(c.id)}>
            {c.nombre}
          </BotonCategoria>
        ))}
      </div>

      {productos.length === 0 ? (
        <p className="py-6 text-center text-gray-500">No hay productos para mostrar.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {productos.map((p) => {
            const agotado = p.disponibles < 1;
            return (
              <button
                key={p.id}
                type="button"
                disabled={agotado}
                onClick={() => onAgregar(p)}
                className="flex flex-col items-start rounded border border-gray-200 p-3 text-left hover:border-amber-600 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="font-medium">{p.nombre}</span>
                <span className="text-sm text-gray-600">{dinero(p.precio)}</span>
                <span className={'mt-1 text-xs ' + (agotado ? 'text-red-700' : p.disponibles <= 5 ? 'text-amber-700' : 'text-gray-500')}>
                  {agotado ? 'Agotado' : `${p.disponibles} disponibles`}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CatalogoProductos;