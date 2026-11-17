import { useEffect, useState } from 'react';
import { crearCompra, getCompra, getCompras, getProveedores } from '../../api/comprasApi';
import { getInsumos } from '../../api/inventarioApi';

const IVA = 0.13;
const dinero = (n) => `$${Number(n ?? 0).toFixed(2)}`;
// El costo por g o ml puede tener 4 decimales (ej. $0.0011)
const costo = (n) => `$${Number(n ?? 0)}`;
const fecha = (f) => (f ? new Date(f).toLocaleDateString('es-SV') : '-');
// Fecha local en formato YYYY-MM-DD (toISOString daría la de UTC)
const hoy = () => new Date().toLocaleDateString('en-CA');

const LINEA_VACIA = { insumoId: '', cantidad: '', costoUnitario: '' };
const COMPRA_VACIA = { proveedorId: '', numeroDocumento: '', fecha: hoy(), condicion: 'CONTADO' };

const inputClase =
  'w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600';
const botonClase =
  'rounded bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:opacity-50';

function ComprasPage() {
  const [compras, setCompras] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [form, setForm] = useState(COMPRA_VACIA);
  const [lineas, setLineas] = useState([{ ...LINEA_VACIA }]);
  const [detalle, setDetalle] = useState(null); // compra abierta en "Ver"
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Pide compras, proveedores e insumos al mismo tiempo
  const cargar = () =>
    Promise.all([getCompras(), getProveedores(), getInsumos()])
      .then(([listaCompras, listaProveedores, listaInsumos]) => {
        setCompras(listaCompras);
        setProveedores(listaProveedores);
        setInsumos(listaInsumos);
      })
      .catch((err) => setError(err.response?.data?.message || 'No se pudieron cargar los datos'));

  useEffect(() => {
    cargar();
  }, []);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Cambia un campo de una línea sin tocar las demás
  const cambiarLinea = (i, campo, valor) =>
    setLineas(lineas.map((l, j) => (j === i ? { ...l, [campo]: valor } : l)));

  const agregarLinea = () => setLineas([...lineas, { ...LINEA_VACIA }]);
  const quitarLinea = (i) => setLineas(lineas.filter((_, j) => j !== i));

  // Totales en vivo (el backend los vuelve a calcular al guardar)
  const subtotal = lineas.reduce((suma, l) => suma + Number(l.cantidad || 0) * Number(l.costoUnitario || 0), 0);
  const iva = subtotal * IVA;

  const unidadDe = (insumoId) => insumos.find((x) => x.id === Number(insumoId))?.unidad ?? '';

  const guardar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');
    setMensaje('');
    try {
      // Mediodía para que la zona horaria no cambie el día
      const nueva = await crearCompra({ ...form, fecha: `${form.fecha}T12:00:00`, detalles: lineas });
      setMensaje(`Compra #${nueva.id} registrada. El inventario ya fue actualizado.`);
      setForm(COMPRA_VACIA);
      setLineas([{ ...LINEA_VACIA }]);
      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo registrar la compra');
    } finally {
      setEnviando(false);
    }
  };

  const ver = async (id) => {
    try {
      setDetalle(await getCompra(id));
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar la compra');
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Compras de insumos</h1>

      {error && <div className="mb-4 rounded bg-red-100 p-3 text-red-800">{error}</div>}
      {mensaje && <div className="mb-4 rounded bg-green-100 p-3 text-green-800">{mensaje}</div>}

      <form onSubmit={guardar} className="mb-6 space-y-4 rounded border border-gray-200 p-4">
        <h2 className="text-lg font-semibold">Registrar factura de compra</h2>

        <div className="grid gap-3 md:grid-cols-4">
          <label className="block">
            <span className="text-sm text-gray-600">Proveedor *</span>
            <select name="proveedorId" value={form.proveedorId} onChange={cambiar} required className={inputClase}>
              <option value="">Seleccione...</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">N.º de factura *</span>
            <input name="numeroDocumento" value={form.numeroDocumento} onChange={cambiar} required className={inputClase} />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Fecha</span>
            <input name="fecha" type="date" value={form.fecha} onChange={cambiar} className={inputClase} />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Condición</span>
            <select name="condicion" value={form.condicion} onChange={cambiar} className={inputClase}>
              <option value="CONTADO">Contado</option>
              <option value="CREDITO">Crédito</option>
            </select>
          </label>
        </div>

        {/* Líneas de la factura: insumo, cantidad y costo */}
        <div className="space-y-2">
          {lineas.map((l, i) => (
            <div key={i} className="grid items-end gap-2 md:grid-cols-12">
              <label className="block md:col-span-5">
                <span className="text-sm text-gray-600">Insumo</span>
                <select value={l.insumoId} onChange={(e) => cambiarLinea(i, 'insumoId', e.target.value)} required className={inputClase}>
                  <option value="">Seleccione...</option>
                  {insumos.map((x) => (
                    <option key={x.id} value={x.id}>{x.nombre} ({x.unidad})</option>
                  ))}
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm text-gray-600">Cantidad {unidadDe(l.insumoId)}</span>
                <input type="number" min="0" step="any" value={l.cantidad} onChange={(e) => cambiarLinea(i, 'cantidad', e.target.value)} required className={inputClase} />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm text-gray-600">Costo unitario</span>
                <input type="number" min="0" step="any" value={l.costoUnitario} onChange={(e) => cambiarLinea(i, 'costoUnitario', e.target.value)} required className={inputClase} />
              </label>
              <p className="py-2 md:col-span-2">{dinero(Number(l.cantidad || 0) * Number(l.costoUnitario || 0))}</p>
              <button type="button" onClick={() => quitarLinea(i)} disabled={lineas.length === 1} className="rounded border border-gray-300 px-2 py-2 hover:bg-gray-100 disabled:opacity-40 md:col-span-1">
                ✕
              </button>
            </div>
          ))}
          <button type="button" onClick={agregarLinea} className="rounded border border-amber-700 px-3 py-1 text-amber-800 hover:bg-amber-50">
            + Agregar insumo
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-3">
          <div className="text-sm">
            <p>Subtotal: {dinero(subtotal)}</p>
            <p>IVA 13%: {dinero(iva)}</p>
            <p className="text-base font-bold">Total: {dinero(subtotal + iva)}</p>
          </div>
          <button type="submit" disabled={enviando} className={botonClase}>
            {enviando ? 'Guardando...' : 'Registrar compra'}
          </button>
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">#</th>
              <th className="p-2">Fecha</th>
              <th className="p-2">Proveedor</th>
              <th className="p-2">Factura</th>
              <th className="p-2">Condición</th>
              <th className="p-2 text-right">Total</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {compras.map((c) => (
              <tr key={c.id} className="border-b border-gray-200">
                <td className="p-2">{c.id}</td>
                <td className="p-2">{fecha(c.fecha)}</td>
                <td className="p-2">{c.proveedor.nombre}</td>
                <td className="p-2">{c.numeroDocumento}</td>
                <td className="p-2">{c.condicion === 'CREDITO' ? `Crédito (${c.cuenta?.estado})` : 'Contado'}</td>
                <td className="p-2 text-right">{dinero(c.total)}</td>
                <td className="p-2 text-right">
                  <button onClick={() => ver(c.id)} className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-100">Ver</button>
                </td>
              </tr>
            ))}
            {compras.length === 0 && (
              <tr><td colSpan="7" className="p-4 text-center text-gray-500">No hay compras registradas</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detalle de la compra seleccionada */}
      {detalle && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4" onClick={() => setDetalle(null)}>
          <div className="w-full max-w-lg rounded bg-white p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-1 text-lg font-semibold">Compra #{detalle.id}</h2>
            <p className="text-sm text-gray-600">
              {detalle.proveedor.nombre} · Factura {detalle.numeroDocumento} · {fecha(detalle.fecha)}
            </p>
            <ul className="my-3 divide-y divide-gray-200 text-sm">
              {detalle.detalles.map((d) => (
                <li key={d.id} className="flex justify-between py-1">
                  <span>{d.insumo.nombre}: {Number(d.cantidad)} {d.insumo.unidad} × {costo(d.costoUnitario)}</span>
                  <span>{dinero(d.subtotal)}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm">Subtotal {dinero(detalle.subtotal)} · IVA {dinero(detalle.iva)}</p>
            <p className="font-bold">Total {dinero(detalle.total)}</p>
            {detalle.cuenta && (
              <p className="mt-2 text-sm">
                Saldo pendiente: {dinero(detalle.cuenta.saldo)} · vence {fecha(detalle.cuenta.fechaVencimiento)}
              </p>
            )}
            <button onClick={() => setDetalle(null)} className={`${botonClase} mt-4`}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComprasPage;
