import { useCallback, useEffect, useState } from 'react';
import { getEmpleados, crearEmpleado, editarEmpleado, desactivarEmpleado, getSucursales } from '../../api/rrhhApi';

import Icono from '../../components/Icono';
import { Alerta, Campo, Encabezado, FilaVacia, Insignia } from '../../components/ui';
import {
  botonClase, botonGris, botonRojo, contenedorTabla, filaClase, inputClase,
  tablaClase, tarjetaClase, tdClase, theadClase, thClase,
} from '../../components/estilos';

const dinero = (n) => `$${Number(n ?? 0).toFixed(2)}`;
const CARGOS = ['Barista', 'Cajero', 'Gerente'];

const EMPLEADO_VACIO = {
  nombre: '', dui: '', nit: '', numeroIsss: '', numeroAfp: '',
  cargo: 'Barista', salarioMensual: '', fechaIngreso: '', sucursalId: '',
};

function EmpleadosPage() {
  const [empleados, setEmpleados] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [form, setForm] = useState(EMPLEADO_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [soloActivos, setSoloActivos] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  // useCallback para que el efecto se vuelva a correr solo cuando cambia el filtro
  const cargar = useCallback(
    () =>
      getEmpleados(soloActivos ? { activo: true } : {})
        .then((lista) => setEmpleados(Array.isArray(lista) ? lista : []))
        .catch((err) => setError(err.response?.data?.message || 'No se pudieron cargar los empleados')),
    [soloActivos],
  );

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Sucursales para el selector del formulario
  useEffect(() => {
    getSucursales()
      .then((lista) => setSucursales(Array.isArray(lista) ? lista : []))
      .catch(() => setError('No se pudieron cargar las sucursales'));
  }, []);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const guardar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');
    setMensaje('');
    try {
      // Mediodía para que la zona horaria no cambie el día
      const datos = {
        ...form,
        salarioMensual: Number(form.salarioMensual),
        sucursalId: Number(form.sucursalId),
        fechaIngreso: `${form.fechaIngreso}T12:00:00`,
        nit: form.nit || undefined,
        numeroIsss: form.numeroIsss || undefined,
        numeroAfp: form.numeroAfp || undefined,
      };
      if (editandoId) {
        await editarEmpleado(editandoId, datos);
        setMensaje('Empleado actualizado.');
      } else {
        const nuevo = await crearEmpleado(datos);
        setMensaje(`Empleado #${nuevo.id} registrado.`);
      }
      setForm(EMPLEADO_VACIO);
      setEditandoId(null);
      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el empleado');
    } finally {
      setEnviando(false);
    }
  };

  const editar = (emp) => {
    setEditandoId(emp.id);
    setMensaje('');
    setForm({
      nombre: emp.nombre,
      dui: emp.dui,
      nit: emp.nit ?? '',
      numeroIsss: emp.numeroIsss ?? '',
      numeroAfp: emp.numeroAfp ?? '',
      cargo: emp.cargo,
      salarioMensual: String(emp.salarioMensual),
      fechaIngreso: emp.fechaIngreso.slice(0, 10),
      sucursalId: String(emp.sucursalId),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelar = () => {
    setEditandoId(null);
    setForm(EMPLEADO_VACIO);
  };

  const desactivar = async (emp) => {
    if (!window.confirm(`¿Desactivar a ${emp.nombre}? Ya no entrará en nuevas planillas.`)) return;
    setError('');
    setMensaje('');
    try {
      await desactivarEmpleado(emp.id);
      setMensaje(`${emp.nombre} fue desactivado.`);
      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo desactivar el empleado');
    }
  };

  return (
    <div>
      <Encabezado icono="badge" titulo="Empleados" descripcion="Baristas, cajeros y gerentes de todas las sucursales" />

      {error && <Alerta tipo="error" onCerrar={() => setError('')}>{error}</Alerta>}
      {mensaje && <Alerta tipo="ok" onCerrar={() => setMensaje('')}>{mensaje}</Alerta>}

      <form onSubmit={guardar} className={`${tarjetaClase} mb-6 space-y-4`}>
        <h3 className="font-semibold text-origen-950">{editandoId ? 'Editar empleado' : 'Registrar empleado'}</h3>

        <div className="grid gap-3 md:grid-cols-3">
          <Campo etiqueta="Nombre completo *">
            <input name="nombre" value={form.nombre} onChange={cambiar} required className={inputClase} />
          </Campo>
          <Campo etiqueta="DUI *">
            <input name="dui" value={form.dui} onChange={cambiar} required placeholder="00000000-0" className={inputClase} />
          </Campo>
          <Campo etiqueta="NIT">
            <input name="nit" value={form.nit} onChange={cambiar} className={inputClase} />
          </Campo>
          <Campo etiqueta="N.º ISSS">
            <input name="numeroIsss" value={form.numeroIsss} onChange={cambiar} className={inputClase} />
          </Campo>
          <Campo etiqueta="N.º AFP">
            <input name="numeroAfp" value={form.numeroAfp} onChange={cambiar} className={inputClase} />
          </Campo>
          <Campo etiqueta="Cargo *">
            <select name="cargo" value={form.cargo} onChange={cambiar} className={inputClase}>
              {CARGOS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Salario mensual *">
            <input name="salarioMensual" type="number" min="0.01" step="0.01" value={form.salarioMensual} onChange={cambiar} required className={inputClase} />
          </Campo>
          <Campo etiqueta="Fecha de ingreso *">
            <input name="fechaIngreso" type="date" value={form.fechaIngreso} onChange={cambiar} required className={inputClase} />
          </Campo>
          <Campo etiqueta="Sucursal *">
            <select name="sucursalId" value={form.sucursalId} onChange={cambiar} required className={inputClase}>
              <option value="" disabled>Selecciona una sucursal</option>
              {sucursales.map((s) => (
                <option key={s.id} value={String(s.id)}>{s.nombre}</option>
              ))}
            </select>
          </Campo>
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={enviando} className={botonClase}>
            <Icono nombre={editandoId ? 'save' : 'person_add'} tamano={20} />
            {enviando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Registrar empleado'}
          </button>
          {editandoId && (
            <button type="button" onClick={cancelar} className={`${botonGris} px-4 py-2`}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <label className="mb-3 flex items-center gap-2 text-sm text-origen-700">
        <input type="checkbox" checked={soloActivos} onChange={(e) => setSoloActivos(e.target.checked)} className="h-4 w-4 accent-origen-700" />
        Mostrar solo empleados activos
      </label>

      <div className={contenedorTabla}>
        <table className={tablaClase}>
          <thead className={theadClase}>
            <tr>
              <th className={thClase}>Nombre</th>
              <th className={thClase}>DUI</th>
              <th className={thClase}>Cargo</th>
              <th className={thClase}>Sucursal</th>
              <th className={`${thClase} text-right`}>Salario mensual</th>
              <th className={thClase}>Estado</th>
              <th className={thClase}></th>
            </tr>
          </thead>
          <tbody>
            {empleados.map((emp) => (
              <tr key={emp.id} className={filaClase}>
                <td className={`${tdClase} font-medium text-origen-950`}>{emp.nombre}</td>
                <td className={tdClase}>{emp.dui}</td>
                <td className={tdClase}>{emp.cargo}</td>
                <td className={tdClase}>{emp.sucursal?.nombre ?? emp.sucursalId}</td>
                <td className={`${tdClase} text-right`}>{dinero(emp.salarioMensual)}</td>
                <td className={tdClase}>
                  <Insignia color={emp.activo ? 'verde' : 'gris'}>{emp.activo ? 'Activo' : 'Inactivo'}</Insignia>
                </td>
                <td className={`${tdClase} whitespace-nowrap text-right`}>
                  <button type="button" onClick={() => editar(emp)} className={`${botonGris} mr-2`}>
                    <Icono nombre="edit" tamano={18} />
                    Editar
                  </button>
                  {emp.activo && (
                    <button type="button" onClick={() => desactivar(emp)} className={botonRojo}>
                      <Icono nombre="person_off" tamano={18} />
                      Desactivar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {empleados.length === 0 && <FilaVacia columnas={7} texto="No hay empleados registrados" />}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EmpleadosPage;