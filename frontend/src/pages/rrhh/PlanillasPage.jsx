import { useEffect, useState } from 'react';
import { getPlanillas, getPlanilla, generarPlanilla, pagarPlanilla } from '../../api/rrhhApi';

import Icono from '../../components/Icono';
import { Alerta, Campo, Encabezado, FilaVacia, Insignia, Modal } from '../../components/ui';
import {
  botonClase, botonGris, contenedorTabla, filaClase, inputClase,
  tablaClase, tarjetaClase, tdClase, theadClase, thClase,
} from '../../components/estilos';

const dinero = (n) => `$${Number(n ?? 0).toFixed(2)}`;
const fecha = (f) => (f ? new Date(f).toLocaleDateString('es-SV') : '-');

const FECHAS_VACIAS = { fechaInicio: '', fechaFin: '' };

// En la base la planilla pagada queda como APROBADA; en pantalla se muestra "PAGADA"
const textoEstado = (estado) => (estado === 'APROBADA' ? 'PAGADA' : estado);

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
    
  useEffect(() => {
    cargar();
  }, []);

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
    <div>
      <Encabezado icono="request_page" titulo="Planillas quincenales" descripcion="Cálculo de ISSS, AFP y renta por quincena" />

      {error && <Alerta tipo="error" onCerrar={() => setError('')}>{error}</Alerta>}
      {mensaje && <Alerta tipo="ok" onCerrar={() => setMensaje('')}>{mensaje}</Alerta>}

      <form onSubmit={generar} className={`${tarjetaClase} mb-6 space-y-4`}>
        <h3 className="font-semibold text-origen-950">Generar planilla</h3>
        <div className="grid items-end gap-3 md:grid-cols-3">
          <Campo etiqueta="Inicio de la quincena *">
            <input name="fechaInicio" type="date" value={form.fechaInicio} onChange={cambiar} required className={inputClase} />
          </Campo>
          <Campo etiqueta="Fin de la quincena *">
            <input name="fechaFin" type="date" value={form.fechaFin} onChange={cambiar} required className={inputClase} />
          </Campo>
          <button type="submit" disabled={enviando} className={botonClase}>
            <Icono nombre="calculate" tamano={20} />
            {enviando ? 'Generando...' : 'Generar planilla'}
          </button>
        </div>
        <p className="text-sm text-gray-500">
          Se calcula para todos los empleados activos: ISSS 3%, AFP 7.25% y retención de renta según la tabla vigente.
        </p>
      </form>

      <div className={contenedorTabla}>
        <table className={tablaClase}>
          <thead className={theadClase}>
            <tr>
              <th className={thClase}>#</th>
              <th className={thClase}>Período</th>
              <th className={thClase}>Tipo</th>
              <th className={thClase}>Estado</th>
              <th className={thClase}></th>
            </tr>
          </thead>
          <tbody>
            {planillas.map((p) => (
              <tr key={p.id} className={filaClase}>
                <td className={tdClase}>{p.id}</td>
                <td className={tdClase}>{fecha(p.fechaInicio)} al {fecha(p.fechaFin)}</td>
                <td className={tdClase}>{p.tipo}</td>
                <td className={tdClase}>
                  <Insignia color={p.estado === 'APROBADA' ? 'verde' : 'amarillo'}>{textoEstado(p.estado)}</Insignia>
                </td>
                <td className={`${tdClase} text-right`}>
                  <button type="button" onClick={() => ver(p.id)} className={botonGris}>
                    <Icono nombre="visibility" tamano={18} />
                    Ver
                  </button>
                </td>
              </tr>
            ))}
            {planillas.length === 0 && <FilaVacia columnas={5} texto="No hay planillas generadas" />}
          </tbody>
        </table>
      </div>

      {/* Detalle de la planilla seleccionada */}
      {detalle && (
        <Modal onCerrar={() => setDetalle(null)} ancho="max-w-4xl">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-origen-950">Planilla #{detalle.id}</h2>
            <Insignia color={detalle.estado === 'APROBADA' ? 'verde' : 'amarillo'}>{textoEstado(detalle.estado)}</Insignia>
          </div>
          <p className="text-sm text-gray-500">
            {fecha(detalle.fechaInicio)} al {fecha(detalle.fechaFin)} · {detalle.tipo}
          </p>

          <div className={`${contenedorTabla} my-4`}>
            <table className={tablaClase}>
              <thead className={theadClase}>
                <tr>
                  <th className={thClase}>Empleado</th>
                  <th className={thClase}>Cargo</th>
                  <th className={`${thClase} text-right`}>Bruto</th>
                  <th className={`${thClase} text-right`}>ISSS</th>
                  <th className={`${thClase} text-right`}>AFP</th>
                  <th className={`${thClase} text-right`}>Renta</th>
                  <th className={`${thClase} text-right`}>Neto</th>
                </tr>
              </thead>
              <tbody>
                {detalle.detalles.map((d) => (
                  <tr key={d.id} className={filaClase}>
                    <td className={`${tdClase} font-medium text-origen-950`}>{d.empleado.nombre}</td>
                    <td className={tdClase}>{d.empleado.cargo}</td>
                    <td className={`${tdClase} text-right`}>{dinero(d.salarioBruto)}</td>
                    <td className={`${tdClase} text-right`}>{dinero(d.isss)}</td>
                    <td className={`${tdClase} text-right`}>{dinero(d.afp)}</td>
                    <td className={`${tdClase} text-right`}>{dinero(d.renta)}</td>
                    <td className={`${tdClase} text-right font-semibold`}>{dinero(d.salarioNeto)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-origen-100 font-bold text-origen-950">
                <tr>
                  <td className={tdClase} colSpan="2">Totales</td>
                  <td className={`${tdClase} text-right`}>{dinero(t.salarioBruto)}</td>
                  <td className={`${tdClase} text-right`}>{dinero(t.isss)}</td>
                  <td className={`${tdClase} text-right`}>{dinero(t.afp)}</td>
                  <td className={`${tdClase} text-right`}>{dinero(t.renta)}</td>
                  <td className={`${tdClase} text-right`}>{dinero(t.salarioNeto)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="rounded-xl bg-origen-100 p-3 text-sm text-origen-700">
            <p>ISSS patronal (7.5%): {dinero(t.isssPatronal)}</p>
            <p>AFP patronal (8.75%): {dinero(t.afpPatronal)}</p>
            <p className="text-base font-bold text-origen-950">Costo total para la empresa: {dinero(costoEmpresa)}</p>
          </div>

          <div className="mt-4 flex gap-2">
            {detalle.estado === 'BORRADOR' && (
              <button type="button" onClick={pagar} className={botonClase}>
                <Icono nombre="check_circle" tamano={20} />
                Marcar como pagada
              </button>
            )}
            <button type="button" onClick={() => setDetalle(null)} className={`${botonGris} px-4 py-2`}>
              Cerrar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default PlanillasPage;