import Icono from '../../components/Icono';
import { dinero } from '../../utils/formato';
import SelectorCliente from './SelectorCliente';

function Carrito({
  items, totales, tipoDocumento, onTipoDocumento, cliente, onCliente,
  onCambiarCantidad, onQuitar, onVaciar, onCobrar, puedeCobrar,
}) {
  const esCcf = tipoDocumento === 'CCF';
  const faltaCliente = esCcf && !cliente;
  const unidades = items.reduce((suma, i) => suma + i.cantidad, 0);

  const tipoClase = (tipo) =>
    'flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ' +
    (tipoDocumento === tipo ? 'bg-origen-700 text-white' : 'text-origen-700 hover:bg-origen-300/50');

  return (
    <div className="flex flex-col gap-4 self-start rounded-2xl border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-origen-950">
          <Icono nombre="receipt_long" className="text-origen-500" />
          Resumen del pedido
          {unidades > 0 && (
            <span className="rounded-full bg-origen-700 px-2 py-0.5 text-xs text-white">{unidades}</span>
          )}
        </h2>
        {items.length > 0 && (
          <button
            type="button"
            onClick={onVaciar}
            title="Vaciar pedido"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-700"
          >
            <Icono nombre="delete_sweep" tamano={20} />
          </button>
        )}
      </div>

      <div className="flex gap-1 rounded-full bg-origen-100 p-1">
        <button type="button" onClick={() => onTipoDocumento('CF')} className={tipoClase('CF')}>
          <Icono nombre="person" tamano={18} />
          Consumidor final
        </button>
        <button type="button" onClick={() => onTipoDocumento('CCF')} className={tipoClase('CCF')}>
          <Icono nombre="business" tamano={18} />
          CCF
        </button>
      </div>

      {esCcf && <SelectorCliente cliente={cliente} onSeleccionar={onCliente} />}

      {items.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-gray-400">
          <Icono nombre="shopping_basket" tamano={40} />
          <p className="mt-2 text-sm">Toca un producto para agregarlo.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {items.map((i) => (
            <li key={i.productoId} className="flex items-center gap-2 py-2.5 text-sm">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-origen-950">{i.nombre}</p>
                <p className="text-gray-500">{dinero(i.precio)} c/u</p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-origen-100 p-0.5">
                <button
                  type="button"
                  onClick={() => onCambiarCantidad(i.productoId, -1)}
                  aria-label={`Quitar uno de ${i.nombre}`}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-origen-700 hover:bg-origen-300/60"
                >
                  <Icono nombre="remove" tamano={16} />
                </button>
                <span className="w-5 text-center font-semibold">{i.cantidad}</span>
                <button
                  type="button"
                  onClick={() => onCambiarCantidad(i.productoId, 1)}
                  disabled={i.cantidad >= i.disponibles}
                  aria-label={`Agregar uno de ${i.nombre}`}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-origen-700 hover:bg-origen-300/60 disabled:opacity-40"
                >
                  <Icono nombre="add" tamano={16} />
                </button>
              </div>
              <div className="w-16 text-right font-medium">{dinero(i.precio * i.cantidad)}</div>
              <button
                type="button"
                onClick={() => onQuitar(i.productoId)}
                aria-label={`Quitar ${i.nombre}`}
                className="text-gray-400 hover:text-red-700"
              >
                <Icono nombre="close" tamano={18} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-1 rounded-xl bg-origen-100 p-3 text-sm">
        <div className="flex justify-between text-origen-700">
          <span>Subtotal sin IVA</span>
          <span>{dinero(totales.subtotal)}</span>
        </div>
        <div className="flex justify-between text-origen-700">
          <span>IVA 13%</span>
          <span>{dinero(totales.iva)}</span>
        </div>
        <div className="flex justify-between border-t border-origen-300 pt-2 text-lg font-bold text-origen-950">
          <span>Total</span>
          <span>{dinero(totales.total)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onCobrar}
        disabled={items.length === 0 || faltaCliente || !puedeCobrar}
        className="flex items-center justify-center gap-2 rounded-full bg-origen-700 py-3 font-semibold text-white transition hover:bg-origen-950 disabled:opacity-50"
      >
        <Icono nombre="payments" />
        Cobrar
      </button>
      {faltaCliente && <p className="text-xs text-gray-500">El CCF necesita un cliente con NIT y NRC.</p>}
    </div>
  );
}

export default Carrito;