import { useEffect, useState } from 'react';
import { crearCompra, getCompra, getCompras, getProveedores } from '../../api/comprasApi';
import { getInsumos } from '../../api/inventarioApi';

import Icono from '../../components/Icono';
import { Alerta, Campo, Encabezado, FilaVacia, Insignia, Modal } from '../../components/ui';
import {
  botonClase, botonGris, contenedorTabla, filaClase, inputClase,
  tablaClase, tarjetaClase, tdClase, theadClase, thClase,
} from '../../components/estilos';

const IVA = 0.13;
const dinero = (n) => `$${Number(n ?? 0).toFixed(2)}`;
// El costo por g o ml puede tener 4 decimales (ej. $0.0011)
const costo = (n) => `$${Number(n ?? 0)}`;
const fecha = (f) => (f ? new Date(f).toLocaleDateString('es-SV') : '-');
// Fecha local en formato YYYY-MM-DD (toISOString daría la de UTC)
const hoy = () => new Date().toLocaleDateString('en-CA');

const LINEA_VACIA = { insumoId: '', cantidad: '', costoUnitario: '' };
const COMPRA_VACIA = { proveedorId: '', numeroDocumento: '', fecha: hoy(), condicion: 'CONTADO' };

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
    <div>
      <Encabezado icono="shopping_cart" titulo="Compras de insumos" descripcion="Facturas de compra que suman al inventario" />

      {error && <Alerta tipo="error">{error}</Alerta>}
      {mensaje && <Alerta tipo="ok" onCerrar={() => setMensaje('')}>{mensaje}</Alerta>}

      <form onSubmit={guardar} className={`${tarjetaClase} mb-6 space-y-4`}>
        <h3 className="font-semibold text-origen-950">Registrar factura de compra</h3>

        <div className="grid gap-3 md:grid-cols-4">
          <Campo etiqueta="Proveedor *">
            <select name="proveedorId" value={form.proveedorId} onChange={cambiar} required className={inputClase}>
              <option value="">Seleccione...</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="N.º de factura *">
            <input name="numeroDocumento" value={form.numeroDocumento} onChange={cambiar} required className={inputClase} />
          </Campo>
          <Campo etiqueta="Fecha">
            <input name="fecha" type="date" value={form.fecha} onChange={cambiar} className={inputClase} />
          </Campo>
          <Campo etiqueta="Condición">
            <select name="condicion" value={form.condicion} onChange={cambiar} className={inputClase}>
              <option value="CONTADO">Contado</option>
              <option value="CREDITO">Crédito</option>
            </select>
          </Campo>
        </div>

        {/* Líneas de la factura: insumo, cantidad y costo */}
        <div className="space-y-3 rounded-xl bg-origen-100/50 p-3">
          {lineas.map((l, i) => (
            <div key={i} className="grid items-end gap-3 md:grid-cols-12">
              <Campo etiqueta="Insumo" className="md:col-span-5">
                <select value={l.insumoId} onChange={(e) => cambiarLinea(i, 'insumoId', e.target.value)} required className={inputClase}>
                  <option value="">Seleccione...</option>
                  {insumos.map((x) => (
                    <option key={x.id} value={x.id}>{x.nombre} ({x.unidad})</option>
                  ))}
                </select>
              </Campo>
              <Campo etiqueta={`Cantidad ${unidadDe(l.insumoId)}`} className="md:col-span-2">
                <input type="number" min="0" step="any" value={l.cantidad} onChange={(e) => cambiarLinea(i, 'cantidad', e.target.value)} required className={inputClase} />
              </Campo>
              <Campo etiqueta="Costo unitario" className="md:col-span-2">
                <input type="number" min="0" step="any" value={l.costoUnitario} onChange={(e) => cambiarLinea(i, 'costoUnitario', e.target.value)} required className={inputClase} />
              </Campo>
              <p className="py-2 font-semibold text-origen-950 md:col-span-2">{dinero(Number(l.cantidad || 0) * Number(l.costoUnitario || 0))}</p>
              <button type="button" onClick={() => quitarLinea(i)} disabled={lineas.length === 1} aria-label="Quitar línea" className={`${botonGris} md:col-span-1`}>
                <Icono nombre="close" tamano={18} />
              </button>
            </div>
          ))}
          <button type="button" onClick={agregarLinea} className={botonGris}>
            <Icono nombre="add_circle" tamano={18} />
            Agregar insumo
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4">
          <div className="text-sm text-origen-700">
            <p>Subtotal: {dinero(subtotal)}</p>
            <p>IVA 13%: {dinero(iva)}</p>
            <p className="text-lg font-bold text-origen-950">Total: {dinero(subtotal + iva)}</p>
          </div>
          <button type="submit" disabled={enviando} className={botonClase}>
            <Icono nombre="check_circle" tamano={20} />
            {enviando ? 'Guardando...' : 'Registrar compra'}
          </button>
        </div>
      </form>

      <div className={contenedorTabla}>
        <table className={tablaClase}>
          <thead className={theadClase}>
            <tr>
              <th className={thClase}>#</th>
              <th className={thClase}>Fecha</th>
              <th className={thClase}>Proveedor</th>
              <th className={thClase}>Factura</th>
              <th className={thClase}>Condición</th>
              <th className={`${thClase} text-right`}>Total</th>
              <th className={thClase}></th>
            </tr>
          </thead>
          <tbody>
            {compras.map((c) => (
              <tr key={c.id} className={filaClase}>
                <td className={tdClase}>{c.id}</td>
                <td className={tdClase}>{fecha(c.fecha)}</td>
                <td className={`${tdClase} font-medium text-origen-950`}>{c.proveedor.nombre}</td>
                <td className={tdClase}>{c.numeroDocumento}</td>
                <td className={tdClase}>
                  {c.condicion === 'CREDITO' ? (
                    <Insignia color="amarillo">Crédito ({c.cuenta?.estado})</Insignia>
                  ) : (
                    <Insignia color="gris">Contado</Insignia>
                  )}
                </td>
                <td className={`${tdClase} text-right font-medium`}>{dinero(c.total)}</td>
                <td className={`${tdClase} text-right`}>
                  <button type="button" onClick={() => ver(c.id)} className={botonGris}>
                    <Icono nombre="visibility" tamano={18} />
                    Ver
                  </button>
                </td>
              </tr>
            ))}
            {compras.length === 0 && <FilaVacia columnas={7} texto="No hay compras registradas" />}
          </tbody>
        </table>
      </div>

      {/* Detalle de la compra seleccionada */}
      {detalle && (
        <Modal onCerrar={() => setDetalle(null)}>
          <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-origen-950">
            <Icono nombre="receipt_long" className="text-origen-500" />
            Compra #{detalle.id}
          </h2>
          <p className="text-sm text-gray-500">
            {detalle.proveedor.nombre} · Factura {detalle.numeroDocumento} · {fecha(detalle.fecha)}
          </p>
          <ul className="my-4 divide-y divide-gray-100 text-sm">
            {detalle.detalles.map((d) => (
              <li key={d.id} className="flex justify-between py-2">
                <span>{d.insumo.nombre}: {Number(d.cantidad)} {d.insumo.unidad} × {costo(d.costoUnitario)}</span>
                <span className="font-medium">{dinero(d.subtotal)}</span>
              </li>
            ))}
          </ul>
          <div className="rounded-xl bg-origen-100 p-3 text-sm text-origen-700">
            <p>Subtotal {dinero(detalle.subtotal)} · IVA {dinero(detalle.iva)}</p>
            <p className="text-lg font-bold text-origen-950">Total {dinero(detalle.total)}</p>
          </div>
          {detalle.cuenta && (
            <p className="mt-3 text-sm">
              Saldo pendiente: {dinero(detalle.cuenta.saldo)} · vence {fecha(detalle.cuenta.fechaVencimiento)}
            </p>
          )}
          <button type="button" onClick={() => setDetalle(null)} className={`${botonClase} mt-4`}>
            Cerrar
          </button>
        </Modal>
      )}
    </div>
  );
}

export default ComprasPage;