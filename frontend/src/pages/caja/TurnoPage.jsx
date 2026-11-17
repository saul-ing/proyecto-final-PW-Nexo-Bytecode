import { useEffect, useState } from 'react';
import { abrirTurno, cerrarTurno, getTurnoActual } from '../../api/cajaApi';

const dinero = (n) => `$${Number(n ?? 0).toFixed(2)}`;
const fecha = (f) => (f ? new Date(f).toLocaleString('es-SV') : '-');

const CIERRE_VACIO = { contadoEfectivo: '', contadoTarjeta: '', contadoDigital: '', observaciones: '' };


const inputClase =
  'w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600 ' +
  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

// Evita que la rueda del mouse cambie el número por accidente
const sinRueda = (e) => e.target.blur();
const botonClase =
  'rounded bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:opacity-50';

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
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Caja y turno</h1>

      {error && <div className="mb-4 rounded bg-red-100 p-3 text-red-800">{error}</div>}

      {/* 1. Reporte del turno que se acaba de cerrar */}
      {reporte && <ReporteCierre reporte={reporte} />}

      {/* 2. Sin turno abierto: formulario de apertura */}
      {!turno && (
        <form onSubmit={abrir} className="mt-4 space-y-3 rounded border border-gray-200 p-4">
          <h2 className="text-lg font-semibold">Abrir turno</h2>
          <label className="block">
            <span className="text-sm text-gray-600">Efectivo inicial en caja (fondo)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={montoInicial}
              onChange={(e) => setMontoInicial(e.target.value)}
              onWheel={sinRueda}
              className={inputClase}
            />
          </label>
          <button type="submit" disabled={enviando} className={botonClase}>
            {enviando ? 'Abriendo...' : 'Abrir turno'}
          </button>
        </form>
      )}

      {/* 3. Turno abierto: datos y formulario de cierre */}
      {turno && (
        <div className="space-y-4">
          <div className="rounded border border-green-200 bg-green-50 p-4">
            <p className="font-semibold text-green-800">Turno #{turno.id} abierto</p>
            <p className="text-sm text-gray-700">Desde: {fecha(turno.fechaApertura)}</p>
            <p className="text-sm text-gray-700">Fondo inicial: {dinero(turno.montoInicial)}</p>
          </div>

          <form onSubmit={cerrar} className="space-y-3 rounded border border-gray-200 p-4">
            <h2 className="text-lg font-semibold">Cerrar turno</h2>
            <p className="text-sm text-gray-600">Cuenta lo que tienes y escríbelo. El sistema calcula la diferencia.</p>

            <label className="block">
              <span className="text-sm text-gray-600">Efectivo contado (incluye el fondo)</span>
              <input type="number" min="0" step="0.01" required name="contadoEfectivo"
                value={cierre.contadoEfectivo} onChange={cambiarCierre} onWheel={sinRueda} className={inputClase} />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">Tarjetas (total del voucher)</span>
              <input type="number" min="0" step="0.01" required name="contadoTarjeta"
                value={cierre.contadoTarjeta} onChange={cambiarCierre} onWheel={sinRueda} className={inputClase} />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">Digital (Bitcoin + Chivo Wallet)</span>
              <input type="number" min="0" step="0.01" required name="contadoDigital"
                value={cierre.contadoDigital} onChange={cambiarCierre} onWheel={sinRueda} className={inputClase} />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">Observaciones (opcional)</span>
              <textarea name="observaciones" rows="2" value={cierre.observaciones}
                onChange={cambiarCierre} className={inputClase} />
            </label>

            <button type="submit" disabled={enviando} className={botonClase}>
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
    <div className="rounded border border-gray-300 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Reporte de cierre, turno #{turno.id}</h2>
        <button onClick={() => window.print()} className="text-sm text-amber-800 underline print:hidden">
          Imprimir
        </button>
      </div>
      <p className="text-sm text-gray-600">Apertura: {fecha(turno.fechaApertura)}</p>
      <p className="mb-3 text-sm text-gray-600">Cierre: {fecha(turno.fechaCierre)}</p>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2">Medio</th>
            <th>Esperado</th>
            <th>Contado</th>
            <th>Diferencia</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.medio} className="border-b">
              <td className="py-2">{f.medio}</td>
              <td>{dinero(f.esperado)}</td>
              <td>{dinero(f.contado)}</td>
              <td className={`font-medium ${colorDif(f.dif)}`}>{textoDif(f.dif)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className={`mt-3 font-semibold ${cuadra ? 'text-green-700' : 'text-red-700'}`}>
        {cuadra ? 'La caja cuadra' : 'La caja tiene diferencias'}
      </p>
      {turno.observaciones && <p className="mt-2 text-sm">Observaciones: {turno.observaciones}</p>}
    </div>
  );
}

export default TurnoPage;