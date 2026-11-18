import { useEffect, useState } from 'react';
import { getPlanillas, getPlanilla, generarPlanilla, pagarPlanilla } from '../../api/rrhhApi';

const dinero = (n) => `$${Number(n ?? 0).toFixed(2)}`;
const fecha = (f) => (f ? new Date(f).toLocaleDateString('es-SV') : '-');

const FECHAS_VACIAS = { fechaInicio: '', fechaFin: '' };

const inputClase =
  'w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600';
const botonClase =
  'rounded bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:opacity-50';

function PlanillasPage() {
  const [planillas, setPlanillas] = useState([]);
  const [form, setForm] = useState(FECHAS_VACIAS);
  const [detalle, setDetalle] = useState(null); // planilla abierta en "Ver"
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

const cargar = () =>
  getPlanillas()
    .then((lista) => setPlanillas(Array.isArray(lista) ? lista : []))
    .catch((err) => setError(err.response?.data?.message || 'No se pudieron cargar las planillas'));

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const generar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');
    setMensaje('');
    try {
      // Mediodía para que la zona horaria no cambie el día
      const nueva = await generarPlanilla({
        fechaInicio: `${form.fechaInicio}T12:00:00`,
        fechaFin: `${form.fechaFin}T12:00:00`,
      });
      setMensaje(`Planilla #${nueva.id} generada en borrador. Revísala antes de marcarla como pagada.`);
      setForm(FECHAS_VACIAS);
      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo generar la planilla');
    } finally {
      setEnviando(false);
    }
  };

  const ver = async (id) => {
    try {
      setDetalle(await getPlanilla(id));
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar la planilla');
    }
  };

  const pagar = async () => {
    if (!window.confirm('¿Marcar esta planilla como pagada? Ya no podrá volver a borrador.')) return;
    try {
      await pagarPlanilla(detalle.id);
      setMensaje(`Planilla #${detalle.id} marcada como pagada.`);
      setDetalle(null);
      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo marcar como pagada');
    }
  };

  const t = detalle?.totales;
  const costoEmpresa = t
    ? Number(t.salarioBruto) + Number(t.isssPatronal) + Number(t.afpPatronal)
    : 0;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Planillas quincenales</h1>

      {error && <div className="mb-4 rounded bg-red-100 p-3 text-red-800">{error}</div>}
      {mensaje && <div className="mb-4 rounded bg-green-100 p-3 text-green-800">{mensaje}</div>}

      <form onSubmit={generar} className="mb-6 space-y-4 rounded border border-gray-200 p-4">
        <h2 className="text-lg font-semibold">Generar planilla</h2>
        <div className="grid items-end gap-3 md:grid-cols-3">
          <label className="block">
            <span className="text-sm text-gray-600">Inicio de la quincena *</span>
            <input name="fechaInicio" type="date" value={form.fechaInicio} onChange={cambiar} required className={inputClase} />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Fin de la quincena *</span>
            <input name="fechaFin" type="date" value={form.fechaFin} onChange={cambiar} required className={inputClase} />
          </label>
          <button type="submit" disabled={enviando} className={botonClase}>
            {enviando ? 'Generando...' : 'Generar planilla'}
          </button>
        </div>
        <p className="text-sm text-gray-500">
          Se calcula para todos los empleados activos: ISSS 3%, AFP 7.25% y retención de renta según la tabla vigente.
        </p>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">#</th>
              <th className="p-2">Período</th>
              <th className="p-2">Tipo</th>
              <th className="p-2">Estado</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {planillas.map((p) => (
              <tr key={p.id} className="border-b border-gray-200">
                <td className="p-2">{p.id}</td>
                <td className="p-2">{fecha(p.fechaInicio)} al {fecha(p.fechaFin)}</td>
                <td className="p-2">{p.tipo}</td>
                <td className="p-2">{p.estado}</td>
                <td className="p-2 text-right">
                  <button onClick={() => ver(p.id)} className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-100">Ver</button>
                </td>
              </tr>
            ))}
            {planillas.length === 0 && (
              <tr><td colSpan="5" className="p-4 text-center text-gray-500">No hay planillas generadas</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detalle de la planilla seleccionada */}
      {detalle && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4" onClick={() => setDetalle(null)}>
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded bg-white p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-1 text-lg font-semibold">Planilla #{detalle.id} ({detalle.estado})</h2>
            <p className="text-sm text-gray-600">
              {fecha(detalle.fechaInicio)} al {fecha(detalle.fechaFin)} · {detalle.tipo}
            </p>

            <div className="my-3 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2">Empleado</th>
                    <th className="p-2">Cargo</th>
                    <th className="p-2 text-right">Bruto</th>
                    <th className="p-2 text-right">ISSS</th>
                    <th className="p-2 text-right">AFP</th>
                    <th className="p-2 text-right">Renta</th>
                    <th className="p-2 text-right">Neto</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.detalles.map((d) => (
                    <tr key={d.id} className="border-b border-gray-200">
                      <td className="p-2">{d.empleado.nombre}</td>
                      <td className="p-2">{d.empleado.cargo}</td>
                      <td className="p-2 text-right">{dinero(d.salarioBruto)}</td>
                      <td className="p-2 text-right">{dinero(d.isss)}</td>
                      <td className="p-2 text-right">{dinero(d.afp)}</td>
                      <td className="p-2 text-right">{dinero(d.renta)}</td>
                      <td className="p-2 text-right font-semibold">{dinero(d.salarioNeto)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-bold">
                  <tr>
                    <td className="p-2" colSpan="2">Totales</td>
                    <td className="p-2 text-right">{dinero(t.salarioBruto)}</td>
                    <td className="p-2 text-right">{dinero(t.isss)}</td>
                    <td className="p-2 text-right">{dinero(t.afp)}</td>
                    <td className="p-2 text-right">{dinero(t.renta)}</td>
                    <td className="p-2 text-right">{dinero(t.salarioNeto)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="text-sm">
              <p>ISSS patronal (7.5%): {dinero(t.isssPatronal)}</p>
              <p>AFP patronal (8.75%): {dinero(t.afpPatronal)}</p>
              <p className="text-base font-bold">Costo total para la empresa: {dinero(costoEmpresa)}</p>
            </div>

            <div className="mt-4 flex gap-2">
              {detalle.estado === 'BORRADOR' && (
                <button onClick={pagar} className={botonClase}>Marcar como pagada</button>
              )}
              <button onClick={() => setDetalle(null)} className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlanillasPage;