import { useEffect, useState } from 'react';
import { getEmpleados, crearEmpleado, editarEmpleado, desactivarEmpleado } from '../../api/rrhhApi';

const dinero = (n) => `$${Number(n ?? 0).toFixed(2)}`;
const CARGOS = ['Barista', 'Cajero', 'Gerente'];

const EMPLEADO_VACIO = {
  nombre: '', dui: '', nit: '', numeroIsss: '', numeroAfp: '',
  cargo: 'Barista', salarioMensual: '', fechaIngreso: '', sucursalId: '',
};

const inputClase =
  'w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600';
const botonClase =
  'rounded bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:opacity-50';

function EmpleadosPage() {
  const [empleados, setEmpleados] = useState([]);
  const [form, setForm] = useState(EMPLEADO_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [soloActivos, setSoloActivos] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

const cargar = () =>
  getEmpleados(soloActivos ? { activo: true } : {})
    .then((lista) => setEmpleados(Array.isArray(lista) ? lista : []))
    .catch((err) => setError(err.response?.data?.message || 'No se pudieron cargar los empleados'));

  useEffect(() => {
    cargar();
  }, [soloActivos]);

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
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Empleados</h1>

      {error && <div className="mb-4 rounded bg-red-100 p-3 text-red-800">{error}</div>}
      {mensaje && <div className="mb-4 rounded bg-green-100 p-3 text-green-800">{mensaje}</div>}

      <form onSubmit={guardar} className="mb-6 space-y-4 rounded border border-gray-200 p-4">
        <h2 className="text-lg font-semibold">{editandoId ? 'Editar empleado' : 'Registrar empleado'}</h2>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="block">
            <span className="text-sm text-gray-600">Nombre completo *</span>
            <input name="nombre" value={form.nombre} onChange={cambiar} required className={inputClase} />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">DUI *</span>
            <input name="dui" value={form.dui} onChange={cambiar} required placeholder="00000000-0" className={inputClase} />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">NIT</span>
            <input name="nit" value={form.nit} onChange={cambiar} className={inputClase} />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">N.º ISSS</span>
            <input name="numeroIsss" value={form.numeroIsss} onChange={cambiar} className={inputClase} />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">N.º AFP</span>
            <input name="numeroAfp" value={form.numeroAfp} onChange={cambiar} className={inputClase} />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Cargo *</span>
            <select name="cargo" value={form.cargo} onChange={cambiar} className={inputClase}>
              {CARGOS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Salario mensual *</span>
            <input name="salarioMensual" type="number" min="0.01" step="0.01" value={form.salarioMensual} onChange={cambiar} required className={inputClase} />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Fecha de ingreso *</span>
            <input name="fechaIngreso" type="date" value={form.fechaIngreso} onChange={cambiar} required className={inputClase} />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">ID de sucursal *</span>
            <input name="sucursalId" type="number" min="1" value={form.sucursalId} onChange={cambiar} required className={inputClase} />
          </label>
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={enviando} className={botonClase}>
            {enviando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Registrar empleado'}
          </button>
          {editandoId && (
            <button type="button" onClick={cancelar} className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100">
              Cancelar
            </button>
          )}
        </div>
      </form>

      <label className="mb-3 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={soloActivos} onChange={(e) => setSoloActivos(e.target.checked)} />
        Mostrar solo empleados activos
      </label>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Nombre</th>
              <th className="p-2">DUI</th>
              <th className="p-2">Cargo</th>
              <th className="p-2">Sucursal</th>
              <th className="p-2 text-right">Salario mensual</th>
              <th className="p-2">Estado</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {empleados.map((emp) => (
              <tr key={emp.id} className="border-b border-gray-200">
                <td className="p-2">{emp.nombre}</td>
                <td className="p-2">{emp.dui}</td>
                <td className="p-2">{emp.cargo}</td>
                <td className="p-2">{emp.sucursal?.nombre ?? emp.sucursalId}</td>
                <td className="p-2 text-right">{dinero(emp.salarioMensual)}</td>
                <td className="p-2">{emp.activo ? 'Activo' : 'Inactivo'}</td>
                <td className="space-x-2 p-2 text-right">
                  <button onClick={() => editar(emp)} className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-100">
                    Editar
                  </button>
                  {emp.activo && (
                    <button onClick={() => desactivar(emp)} className="rounded border border-red-300 px-3 py-1 text-red-700 hover:bg-red-50">
                      Desactivar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {empleados.length === 0 && (
              <tr><td colSpan="7" className="p-4 text-center text-gray-500">No hay empleados registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EmpleadosPage;