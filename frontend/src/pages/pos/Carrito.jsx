import { dinero } from '../../utils/formato';
import SelectorCliente from './SelectorCliente';

function Carrito({
  items, totales, tipoDocumento, onTipoDocumento, cliente, onCliente,
  onCambiarCantidad, onQuitar, onVaciar, onCobrar, puedeCobrar,
}) {
  const esCcf = tipoDocumento === 'CCF';
  const faltaCliente = esCcf && !cliente;

  const tipoClase = (tipo) =>
    'flex-1 rounded border px-3 py-1 text-sm ' +
    (tipoDocumento === tipo
      ? 'border-amber-700 bg-amber-700 text-white'
      : 'border-gray-300 text-gray-700 hover:bg-gray-100');

  return (
    <div className="space-y-3 rounded border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Pedido</h2>
        {items.length > 0 && (
          <button type="button" onClick={onVaciar} className="text-sm text-gray-600 underline">
            Vaciar
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={() => onTipoDocumento('CF')} className={tipoClase('CF')}>
          Consumidor final
        </button>
        <button type="button" onClick={() => onTipoDocumento('CCF')} className={tipoClase('CCF')}>
          CCF
        </button>
      </div>

      {esCcf && <SelectorCliente cliente={cliente} onSeleccionar={onCliente} />}

      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500">Toca un producto para agregarlo.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {items.map((i) => (
            <li key={i.productoId} className="flex items-center justify-between gap-2 py-2 text-sm">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{i.nombre}</p>
                <p className="text-gray-500">{dinero(i.precio)} c/u</p>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => onCambiarCantidad(i.productoId, -1)}
                  className="h-7 w-7 rounded border border-gray-300 hover:bg-gray-100">-</button>
                <span className="w-6 text-center">{i.cantidad}</span>
                <button type="button" onClick={() => onCambiarCantidad(i.productoId, 1)}
                  disabled={i.cantidad >= i.disponibles}
                  className="h-7 w-7 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40">+</button>
              </div>
              <div className="w-16 text-right">{dinero(i.precio * i.cantidad)}</div>
              <button type="button" onClick={() => onQuitar(i.productoId)} aria-label={`Quitar ${i.nombre}`}
                className="text-red-700">x</button>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-1 border-t border-gray-200 pt-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal sin IVA</span><span>{dinero(totales.subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>IVA 13%</span><span>{dinero(totales.iva)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span><span>{dinero(totales.total)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onCobrar}
        disabled={items.length === 0 || faltaCliente || !puedeCobrar}
        className="w-full rounded bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:opacity-50"
      >
        Cobrar
      </button>
      {faltaCliente && <p className="text-xs text-gray-500">El CCF necesita un cliente con NIT y NRC.</p>}
    </div>
  );
}

export default Carrito;