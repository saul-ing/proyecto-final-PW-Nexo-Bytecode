import { useEffect, useState } from 'react';
import { crearAbono, getCuentas } from '../../api/comprasApi';

import Icono from '../../components/Icono';
import { Alerta, Campo, Encabezado, FilaVacia, Modal } from '../../components/ui';
import {
  botonClase, botonGris, contenedorTabla, etiquetaClase, filaClase, inputClase,
  tablaClase, tdClase, theadClase, thClase,
} from '../../components/estilos';

const dinero = (n) => `$${Number(n ?? 0).toFixed(2)}`;
const fecha = (f) => (f ? new Date(f).toLocaleDateString('es-SV') : '-');

const ABONO_VACIO = { monto: '', medioPago: 'EFECTIVO', nota: '' };

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
    <div>
      <Encabezado icono="payments" titulo="Cuentas por pagar" descripcion="Saldos con proveedores y abonos" />

      {error && <Alerta tipo="error" onCerrar={() => setError('')}>{error}</Alerta>}

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-origen-100 p-4">
          <p className="mb-1 flex items-center gap-2 text-sm text-origen-500">
            <Icono nombre="account_balance_wallet" tamano={20} />
            Saldo pendiente
          </p>
          <p className="text-2xl font-bold text-origen-950">{dinero(totalPendiente)}</p>
        </div>
        <div className={`rounded-2xl p-4 ${vencidas.length ? 'bg-red-50' : 'bg-origen-100'}`}>
          <p className={`mb-1 flex items-center gap-2 text-sm ${vencidas.length ? 'text-red-700' : 'text-origen-500'}`}>
            <Icono nombre="event_busy" tamano={20} />
            Cuentas vencidas
          </p>
          <p className={`text-2xl font-bold ${vencidas.length ? 'text-red-700' : 'text-origen-950'}`}>{vencidas.length}</p>
        </div>
        <label className="block rounded-2xl border border-gray-200 p-4">
          <span className={etiquetaClase}>Filtrar por estado</span>
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className={inputClase}>
            <option value="">Todas</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="PARCIAL">Parciales</option>
            <option value="PAGADA">Pagadas</option>
          </select>
        </label>
      </div>

      <div className={contenedorTabla}>
        <table className={tablaClase}>
          <thead className={theadClase}>
            <tr>
              <th className={thClase}>Proveedor</th>
              <th className={thClase}>Factura</th>
              <th className={thClase}>Vence</th>
              <th className={`${thClase} text-right`}>Monto</th>
              <th className={`${thClase} text-right`}>Saldo</th>
              <th className={thClase}>Estado</th>
              <th className={thClase}></th>
            </tr>
          </thead>
          <tbody>
            {cuentas.map((c) => (
              <tr key={c.id} className={`${filaClase} ${c.vencida ? 'bg-red-50' : ''}`}>
                <td className={`${tdClase} font-medium text-origen-950`}>{c.compra.proveedor.nombre}</td>
                <td className={tdClase}>{c.compra.numeroDocumento}</td>
                <td className={tdClase}>
                  {fecha(c.fechaVencimiento)}
                  {c.vencida && <span className="ml-2 font-semibold text-red-700">Vencida</span>}
                </td>
                <td className={`${tdClase} text-right`}>{dinero(c.monto)}</td>
                <td className={`${tdClase} text-right font-semibold`}>{dinero(c.saldo)}</td>
                <td className={tdClase}>
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorEstado[c.estado]}`}>{c.estado}</span>
                </td>
                <td className={`${tdClase} text-right`}>
                  {c.estado !== 'PAGADA' && (
                    <button type="button" onClick={() => abrirAbono(c)} className={botonGris}>
                      <Icono nombre="payments" tamano={18} />
                      Abonar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {cuentas.length === 0 && <FilaVacia columnas={7} texto="No hay cuentas por pagar" />}
          </tbody>
        </table>
      </div>

      {/* Formulario de abono */}
      {seleccionada && (
        <Modal onCerrar={() => setSeleccionada(null)} ancho="max-w-md">
          <form onSubmit={guardarAbono} className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-origen-950">Abonar a {seleccionada.compra.proveedor.nombre}</h2>
              <p className="text-sm text-gray-500">
                Factura {seleccionada.compra.numeroDocumento} · saldo {dinero(seleccionada.saldo)}
              </p>
            </div>
            <Campo etiqueta="Monto">
              <input type="number" min="0.01" step="0.01" max={Number(seleccionada.saldo)} value={abono.monto}
                onChange={(e) => setAbono({ ...abono, monto: e.target.value })} required className={inputClase} />
            </Campo>
            <Campo etiqueta="Medio de pago">
              <select value={abono.medioPago} onChange={(e) => setAbono({ ...abono, medioPago: e.target.value })} className={inputClase}>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="BITCOIN">Bitcoin</option>
                <option value="CHIVO_WALLET">Chivo Wallet</option>
              </select>
            </Campo>
            <Campo etiqueta="Nota (opcional)">
              <input value={abono.nota} onChange={(e) => setAbono({ ...abono, nota: e.target.value })} className={inputClase} />
            </Campo>
            <div className="flex gap-2">
              <button type="submit" disabled={enviando} className={botonClase}>
                <Icono nombre="check_circle" tamano={20} />
                Registrar abono
              </button>
              <button type="button" onClick={() => setSeleccionada(null)} className={`${botonGris} px-4 py-2`}>
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default CuentasPorPagarPage;