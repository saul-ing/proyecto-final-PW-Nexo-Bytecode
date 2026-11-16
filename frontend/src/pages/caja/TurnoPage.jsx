import { useEffect, useState } from 'react';
import { abrirTurno, getTurnoActual } from '../../api/cajaApi';

const dinero = (n) => `$${Number(n ?? 0).toFixed(2)}`;
const fecha = (f) => (f ? new Date(f).toLocaleString('es-SV') : '-');

const inputClase =
  'w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600';
const botonClase =
  'rounded bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:opacity-50';

function TurnoPage() {
  const [turno, setTurno] = useState(null); // turno abierto
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [montoInicial, setMontoInicial] = useState('');

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
      setMontoInicial('');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo abrir el turno');
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <div className="p-6">Cargando...</div>;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Caja y turno</h1>

      {error && <div className="mb-4 rounded bg-red-100 p-3 text-red-800">{error}</div>}

      {/* Sin turno abierto: formulario de apertura */}
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
              className={inputClase}
            />
          </label>
          <button type="submit" disabled={enviando} className={botonClase}>
            {enviando ? 'Abriendo...' : 'Abrir turno'}
          </button>
        </form>
      )}

      {/* Turno abierto: datos del turno */}
      {turno && (
        <div className="rounded border border-green-200 bg-green-50 p-4">
          <p className="font-semibold text-green-800">Turno #{turno.id} abierto</p>
          <p className="text-sm text-gray-700">Desde: {fecha(turno.fechaApertura)}</p>
          <p className="text-sm text-gray-700">Fondo inicial: {dinero(turno.montoInicial)}</p>
        </div>
      )}
    </div>
  );
}

export default TurnoPage;