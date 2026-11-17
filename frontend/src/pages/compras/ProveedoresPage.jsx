import { useEffect, useState } from 'react';
import { crearProveedor, editarProveedor, eliminarProveedor, getProveedores } from '../../api/comprasApi';

const VACIO = { nombre: '', nit: '', nrc: '', telefono: '', email: '', diasCredito: 0 };

const inputClase =
  'w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600';
const botonClase =
  'rounded bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:opacity-50';

function ProveedoresPage() {
  const [proveedores, setProveedores] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cargar = () =>
    getProveedores()
      .then(setProveedores)
      .catch((err) => setError(err.response?.data?.message || 'No se pudieron cargar los proveedores'));

  // Carga la lista al abrir la pantalla
  useEffect(() => {
    getProveedores()
      .then(setProveedores)
      .catch((err) => setError(err.response?.data?.message || 'No se pudieron cargar los proveedores'));
  }, []);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const limpiar = () => {
    setForm(VACIO);
    setEditandoId(null);
  };

  const guardar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      if (editandoId) await editarProveedor(editandoId, form);
      else await crearProveedor(form);
      limpiar();
      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el proveedor');
    } finally {
      setEnviando(false);
    }
  };

  // Pasa los datos del proveedor al formulario (null se muestra vacío)
  const editar = (p) => {
    setEditandoId(p.id);
    setForm({
      nombre: p.nombre,
      nit: p.nit ?? '',
      nrc: p.nrc ?? '',
      telefono: p.telefono ?? '',
      email: p.email ?? '',
      diasCredito: p.diasCredito,
    });
  };

  const eliminar = async (p) => {
    if (!window.confirm(`¿Desactivar a ${p.nombre}?`)) return;
    try {
      await eliminarProveedor(p.id);
      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo desactivar el proveedor');
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Proveedores</h1>

      {error && <div className="mb-4 rounded bg-red-100 p-3 text-red-800">{error}</div>}

      <form onSubmit={guardar} className="mb-6 grid gap-3 rounded border border-gray-200 p-4 md:grid-cols-3">
        <h2 className="text-lg font-semibold md:col-span-3">{editandoId ? 'Editar proveedor' : 'Nuevo proveedor'}</h2>
        <label className="block">
          <span className="text-sm text-gray-600">Nombre *</span>
          <input name="nombre" value={form.nombre} onChange={cambiar} required className={inputClase} />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">NIT</span>
          <input name="nit" value={form.nit} onChange={cambiar} className={inputClase} />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">NRC</span>
          <input name="nrc" value={form.nrc} onChange={cambiar} className={inputClase} />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">Teléfono</span>
          <input name="telefono" value={form.telefono} onChange={cambiar} className={inputClase} />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">Correo</span>
          <input name="email" type="email" value={form.email} onChange={cambiar} className={inputClase} />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">Días de crédito (0 = contado)</span>
          <input name="diasCredito" type="number" min="0" step="1" value={form.diasCredito} onChange={cambiar} className={inputClase} />
        </label>
        <div className="flex gap-2 md:col-span-3">
          <button type="submit" disabled={enviando} className={botonClase}>
            {editandoId ? 'Guardar cambios' : 'Agregar proveedor'}
          </button>
          {editandoId && (
            <button type="button" onClick={limpiar} className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100">
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Nombre</th>
              <th className="p-2">NIT</th>
              <th className="p-2">NRC</th>
              <th className="p-2">Teléfono</th>
              <th className="p-2">Correo</th>
              <th className="p-2">Crédito</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map((p) => (
              <tr key={p.id} className="border-b border-gray-200">
                <td className="p-2 font-medium">{p.nombre}</td>
                <td className="p-2">{p.nit || '-'}</td>
                <td className="p-2">{p.nrc || '-'}</td>
                <td className="p-2">{p.telefono || '-'}</td>
                <td className="p-2">{p.email || '-'}</td>
                <td className="p-2">{p.diasCredito === 0 ? 'Contado' : `${p.diasCredito} días`}</td>
                <td className="p-2 text-right whitespace-nowrap">
                  <button onClick={() => editar(p)} className="mr-2 rounded border border-gray-300 px-3 py-1 hover:bg-gray-100">Editar</button>
                  <button onClick={() => eliminar(p)} className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700">Desactivar</button>
                </td>
              </tr>
            ))}
            {proveedores.length === 0 && (
              <tr><td colSpan="7" className="p-4 text-center text-gray-500">No hay proveedores registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProveedoresPage;
