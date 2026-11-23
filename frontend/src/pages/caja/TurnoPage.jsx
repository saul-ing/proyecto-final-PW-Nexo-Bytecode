import { useEffect, useState } from 'react';
import { abrirTurno, cerrarTurno, getTurnoActual } from '../../api/cajaApi';

import Icono from '../../components/Icono';
import { Alerta, Campo, Encabezado } from '../../components/ui';
import { botonClase, inputClase, numeroClase, tarjetaClase } from '../../components/estilos';

const dinero = (n) => `$${Number(n ?? 0).toFixed(2)}`;
const fecha = (f) => (f ? new Date(f).toLocaleString('es-SV') : '-');

const CIERRE_VACIO = { contadoEfectivo: '', contadoTarjeta: '', contadoDigital: '', observaciones: '' };

// Evita que la rueda del mouse cambie el número por accidente
const sinRueda = (e) => e.target.blur();

function TurnoPage() {
  const [turno, setTurno] = useState(null); // turno abierto
  const [reporte, setReporte] = useState(null); // { turno, diferencias } del último cierre
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [montoInicial, setMontoInicial] = useState('');
  const [cierre, setCierre] = useState(CIERRE_VACIO);

  useEffect(() => {
    getTurnoActual()
      .then(setTurno)
      .catch((err) => setError(err.response?.data?.message || 'No se pudo cargar el turno'))
      .finally(() => setCargando(false));
  }, []);

  const abrir = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      setTurno(await abrirTurno(montoInicial));
      setReporte(null);
      setMontoInicial('');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo abrir el turno');
    } finally {
      setEnviando(false);
    }
  };

  const cerrar = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      setReporte(await cerrarTurno(cierre));
      setTurno(null);
      setCierre(CIERRE_VACIO);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cerrar el turno');
    } finally {
      setEnviando(false);
    }
  };

  const cambiarCierre = (e) => setCierre({ ...cierre, [e.target.name]: e.target.value });

  if (cargando) return <div className="p-6">Cargando...</div>;

  return (
    <div className="mx-auto max-w-2xl">
      <Encabezado
        principal
        icono="account_balance_wallet"
        titulo="Caja y turno"
        descripcion="Apertura, cierre y cuadre del turno"
      />

      {error && <Alerta tipo="error">{error}</Alerta>}

      {/* 1. Reporte del turno que se acaba de cerrar */}
      {reporte && <ReporteCierre reporte={reporte} />}

      {/* 2. Sin turno abierto: formulario de apertura */}
      {!turno && (
        <form onSubmit={abrir} className={`${tarjetaClase} space-y-4`}>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-origen-950">
            <Icono nombre="lock_open" className="text-origen-500" />
            Abrir turno
          </h2>
          <Campo etiqueta="Efectivo inicial en caja (fondo)">
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={montoInicial}
              onChange={(e) => setMontoInicial(e.target.value)}
              onWheel={sinRueda}
              className={numeroClase}
            />
          </Campo>
          <button type="submit" disabled={enviando} className={botonClase}>
            <Icono nombre="lock_open" tamano={20} />
            {enviando ? 'Abriendo...' : 'Abrir turno'}
          </button>
        </form>
      )}

      {/* 3. Turno abierto: datos y formulario de cierre */}
      {turno && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl bg-origen-100 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-origen-700 text-origen-100">
              <Icono nombre="lock_open" />
            </div>
            <div>
              <p className="font-semibold text-origen-950">Turno #{turno.id} abierto</p>
              <p className="text-sm text-origen-700">Desde: {fecha(turno.fechaApertura)}</p>
              <p className="text-sm text-origen-700">Fondo inicial: {dinero(turno.montoInicial)}</p>
            </div>
          </div>

          <form onSubmit={cerrar} className={`${tarjetaClase} space-y-4`}>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-origen-950">
              <Icono nombre="lock" className="text-origen-500" />
              Cerrar turno
            </h2>
            <p className="text-sm text-gray-500">Cuenta lo que tienes y escríbelo. El sistema calcula la diferencia.</p>

            <Campo etiqueta="Efectivo contado (incluye el fondo)">
              <input type="number" min="0" step="0.01" required name="contadoEfectivo"
                value={cierre.contadoEfectivo} onChange={cambiarCierre} onWheel={sinRueda} className={numeroClase} />
            </Campo>
            <Campo etiqueta="Tarjetas (total del voucher)">
              <input type="number" min="0" step="0.01" required name="contadoTarjeta"
                value={cierre.contadoTarjeta} onChange={cambiarCierre} onWheel={sinRueda} className={numeroClase} />
            </Campo>
            <Campo etiqueta="Digital (Bitcoin + Chivo Wallet)">
              <input type="number" min="0" step="0.01" required name="contadoDigital"
                value={cierre.contadoDigital} onChange={cambiarCierre} onWheel={sinRueda} className={numeroClase} />
            </Campo>
            <Campo etiqueta="Observaciones (opcional)">
              <textarea name="observaciones" rows="2" value={cierre.observaciones}
                onChange={cambiarCierre} className={inputClase} />
            </Campo>

            <button type="submit" disabled={enviando} className={botonClase}>
              <Icono nombre="lock" tamano={20} />
              {enviando ? 'Cerrando...' : 'Cerrar turno'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// Reporte de cierre: esperado vs contado por medio de pago
function ReporteCierre({ reporte }) {
  const { turno, diferencias } = reporte;
  const filas = [
    { medio: 'Efectivo', esperado: turno.esperadoEfectivo, contado: turno.contadoEfectivo, dif: diferencias.efectivo },
    { medio: 'Tarjeta', esperado: turno.esperadoTarjeta, contado: turno.contadoTarjeta, dif: diferencias.tarjeta },
    { medio: 'Digital', esperado: turno.esperadoDigital, contado: turno.contadoDigital, dif: diferencias.digital },
  ];
  const cuadra = filas.every((f) => f.dif === 0);

  const colorDif = (d) => (d === 0 ? 'text-green-700' : d < 0 ? 'text-red-700' : 'text-amber-700');
  const textoDif = (d) => (d === 0 ? 'Cuadra' : d < 0 ? `Faltan ${dinero(-d)}` : `Sobran ${dinero(d)}`);

  return (
    <div className={`${tarjetaClase} mb-4`}>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-origen-950">
          <Icono nombre="fact_check" className="text-origen-500" />
          Reporte de cierre, turno #{turno.id}
        </h2>
        <button type="button" onClick={() => window.print()} className="flex items-center gap-1 text-sm font-medium text-origen-700 hover:underline print:hidden">
          <Icono nombre="print" tamano={18} />
          Imprimir
        </button>
      </div>
      <p className="text-sm text-gray-500">Apertura: {fecha(turno.fechaApertura)}</p>
      <p className="mb-3 text-sm text-gray-500">Cierre: {fecha(turno.fechaCierre)}</p>

      <table className="w-full text-left text-sm">
        <thead className="bg-origen-100 text-origen-700">
          <tr>
            <th className="px-3 py-2 font-semibold">Medio</th>
            <th className="px-3 py-2 font-semibold">Esperado</th>
            <th className="px-3 py-2 font-semibold">Contado</th>
            <th className="px-3 py-2 font-semibold">Diferencia</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.medio} className="border-b border-gray-100 last:border-0">
              <td className="px-3 py-2.5">
                <span className="flex items-center gap-2">
                  <Icono nombre={f.medio === 'Efectivo' ? 'payments' : f.medio === 'Tarjeta' ? 'credit_card' : 'currency_bitcoin'} tamano={20} className="text-origen-500" />
                  {f.medio}
                </span>
              </td>
              <td className="px-3 py-2.5">{dinero(f.esperado)}</td>
              <td className="px-3 py-2.5">{dinero(f.contado)}</td>
              <td className="px-3 py-2.5">
                <span className={`inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold ${colorDif(f.dif)}`}>{textoDif(f.dif)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={`mt-4 flex items-center gap-2 rounded-xl p-3 font-semibold ${cuadra ? 'bg-origen-100 text-origen-950' : 'bg-red-50 text-red-700'}`}>
        <Icono nombre={cuadra ? 'check_circle' : 'error'} />
        {cuadra ? 'La caja cuadra' : 'La caja tiene diferencias'}
      </div>
      {turno.observaciones && <p className="mt-2 text-sm">Observaciones: {turno.observaciones}</p>}
    </div>
  );
}

export default TurnoPage;