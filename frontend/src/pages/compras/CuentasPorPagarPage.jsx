import { useEffect, useState } from 'react';
import { crearAbono, getCuentas } from '../../api/comprasApi';

const dinero = (n) => `$${Number(n ?? 0).toFixed(2)}`;
const fecha = (f) => (f ? new Date(f).toLocaleDateString('es-SV') : '-');

const ABONO_VACIO = { monto: '', medioPago: 'EFECTIVO', nota: '' };

const inputClase =
  'w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600';
const botonClase =
  'rounded bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:opacity-50';

// Color de la etiqueta según el estado
const colorEstado = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  PARCIAL: 'bg-blue-100 text-blue-800',
  PAGADA: 'bg-green-100 text-green-800',
};

function CuentasPorPagarPage() {
  const [cuentas, setCuentas] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [seleccionada, setSeleccionada] = useState(null); // cuenta a la que se abona
  const [abono, setAbono] = useState(ABONO_VACIO);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Se vuelve a cargar cada vez que cambia el filtro
  useEffect(() => {
    getCuentas(filtro || undefined)
      .then(setCuentas)
      .catch((err) => setError(err.response?.data?.message || 'No se pudieron cargar las cuentas'));
  }, [filtro]);

  // Resumen con reduce sobre el arreglo de cuentas
  const totalPendiente = cuentas.reduce((suma, c) => suma + Number(c.saldo), 0);
  const vencidas = cuentas.filter((c) => c.vencida);

  const abrirAbono = (c) => {
    setSeleccionada(c);
    setAbono({ ...ABONO_VACIO, monto: Number(c.saldo).toFixed(2) });
  };

  const guardarAbono = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      await crearAbono(seleccionada.id, abono);
      setSeleccionada(null);
      setCuentas(await getCuentas(filtro || undefined));
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo registrar el abono');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Cuentas por pagar</h1>

      {error && <div className="mb-4 rounded bg-red-100 p-3 text-red-800">{error}</div>}

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <div className="rounded border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Saldo pendiente</p>
          <p className="text-2xl font-bold">{dinero(totalPendiente)}</p>
        </div>
        <div className={`rounded border p-4 ${vencidas.length ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
          <p className="text-sm text-gray-600">Cuentas vencidas</p>
          <p className="text-2xl font-bold">{vencidas.length}</p>
        </div>
        <label className="block rounded border border-gray-200 p-4">
          <span className="text-sm text-gray-600">Filtrar por estado</span>
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className={inputClase}>
            <option value="">Todas</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="PARCIAL">Parciales</option>
            <option value="PAGADA">Pagadas</option>
          </select>
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Proveedor</th>
              <th className="p-2">Factura</th>
              <th className="p-2">Vence</th>
              <th className="p-2 text-right">Monto</th>
              <th className="p-2 text-right">Saldo</th>
              <th className="p-2">Estado</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {cuentas.map((c) => (
              <tr key={c.id} className={`border-b border-gray-200 ${c.vencida ? 'bg-red-50' : ''}`}>
                <td className="p-2">{c.compra.proveedor.nombre}</td>
                <td className="p-2">{c.compra.numeroDocumento}</td>
                <td className="p-2">
                  {fecha(c.fechaVencimiento)}
                  {c.vencida && <span className="ml-2 font-semibold text-red-700">Vencida</span>}
                </td>
                <td className="p-2 text-right">{dinero(c.monto)}</td>
                <td className="p-2 text-right font-medium">{dinero(c.saldo)}</td>
                <td className="p-2">
                  <span className={`rounded px-2 py-1 text-xs font-semibold ${colorEstado[c.estado]}`}>{c.estado}</span>
                </td>
                <td className="p-2 text-right">
                  {c.estado !== 'PAGADA' && (
                    <button onClick={() => abrirAbono(c)} className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-100">Abonar</button>
                  )}
                </td>
              </tr>
            ))}
            {cuentas.length === 0 && (
              <tr><td colSpan="7" className="p-4 text-center text-gray-500">No hay cuentas por pagar</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Formulario de abono */}
      {seleccionada && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4" onClick={() => setSeleccionada(null)}>
          <form onSubmit={guardarAbono} className="w-full max-w-md space-y-3 rounded bg-white p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">Abonar a {seleccionada.compra.proveedor.nombre}</h2>
            <p className="text-sm text-gray-600">Factura {seleccionada.compra.numeroDocumento} · saldo {dinero(seleccionada.saldo)}</p>
            <label className="block">
              <span className="text-sm text-gray-600">Monto</span>
              <input type="number" min="0.01" step="0.01" max={Number(seleccionada.saldo)} value={abono.monto}
                onChange={(e) => setAbono({ ...abono, monto: e.target.value })} required className={inputClase} />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">Medio de pago</span>
              <select value={abono.medioPago} onChange={(e) => setAbono({ ...abono, medioPago: e.target.value })} className={inputClase}>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="BITCOIN">Bitcoin</option>
                <option value="CHIVO_WALLET">Chivo Wallet</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">Nota (opcional)</span>
              <input value={abono.nota} onChange={(e) => setAbono({ ...abono, nota: e.target.value })} className={inputClase} />
            </label>
            <div className="flex gap-2">
              <button type="submit" disabled={enviando} className={botonClase}>Registrar abono</button>
              <button type="button" onClick={() => setSeleccionada(null)} className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100">Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default CuentasPorPagarPage;
