import { useEffect, useState } from 'react';
import { crearInsumo, editarInsumo, eliminarInsumo, getAlertas, getInsumos } from '../../api/inventarioApi';

// Cambio: unidad G/ML/UNIDAD, se agrega costo, stockActual pasa a cantidad
const VACIO = { nombre: '', unidad: 'G', costoUnitario: '', cantidad: '', stockMinimo: '' };

// Clases de Tailwind compartidas con caja y compras
const inputClase = 'w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600';
const botonClase = 'rounded bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800';
const botonGris = 'rounded border border-gray-300 px-3 py-1 hover:bg-gray-100';
const botonRojo = 'rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700';

function InsumosPage() {
  const [insumos, setInsumos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState('');

  // Carga insumos y alertas al mismo tiempo
  const cargar = () =>
    Promise.all([getInsumos(), getAlertas()])
      .then(([lista, bajos]) => {
        setInsumos(lista);
        setAlertas(bajos);
      })
      .catch((err) => setError(err.response?.data?.message || 'No se pudieron cargar los insumos'));

  // Carga la lista al abrir la pantalla
  useEffect(() => {
    Promise.all([getInsumos(), getAlertas()])
      .then(([lista, bajos]) => {
        setInsumos(lista);
        setAlertas(bajos);
      })
      .catch((err) => setError(err.response?.data?.message || 'No se pudieron cargar los insumos'));
  }, []);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const guardar = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) await editarInsumo(editandoId, form);
      else await crearInsumo(form);
      setForm(VACIO);
      setEditandoId(null);
      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar');
    }
  };

  const editar = (i) => {
    setEditandoId(i.id);
    setForm({ nombre: i.nombre, unidad: i.unidad, costoUnitario: i.costoUnitario, cantidad: i.cantidad, stockMinimo: i.stockMinimo });
  };

  const eliminar = async (id) => {
    try {
      await eliminarInsumo(id);
      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar');
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Insumos</h1>

      {error && <div className="mb-4 rounded bg-red-100 p-3 text-red-800" onClick={() => setError('')}>{error}</div>}

      {/* Panel de alertas de stock mínimo */}
      {alertas.length > 0 && (
        <div className="mb-4 rounded bg-yellow-100 p-3 text-yellow-800">
          <strong>Stock bajo:</strong>
          <ul className="ml-5 list-disc">
            {/* Cambio: la alerta trae el insumo adentro y usa cantidad */}
            {alertas.map((a) => (
              <li key={a.id}>{a.insumo.nombre}: quedan {Number(a.cantidad)} (mínimo {Number(a.stockMinimo)})</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={guardar} className="mb-4">
        <div className="grid gap-2 md:grid-cols-6">
          <div><input name="nombre" placeholder="Nombre" value={form.nombre} onChange={cambiar} required className={inputClase} /></div>
          <div>
            <select name="unidad" value={form.unidad} onChange={cambiar} className={inputClase}>
              {/* Cambio: valores del enum de Saúl */}
              <option value="G">Gramos</option>
              <option value="ML">Mililitros</option>
              <option value="UNIDAD">Unidades</option>
            </select>
          </div>
          {/* Nuevo: costo unitario */}
          <div><input name="costoUnitario" type="number" step="any" placeholder="Costo unit." value={form.costoUnitario} onChange={cambiar} className={inputClase} /></div>
          {/* Cambio: la cantidad solo al crear; luego cambia con compras y ventas */}
          {!editandoId && (
            <div><input name="cantidad" type="number" step="any" placeholder="Stock inicial" value={form.cantidad} onChange={cambiar} className={inputClase} /></div>
          )}
          <div><input name="stockMinimo" type="number" step="any" placeholder="Mínimo" value={form.stockMinimo} onChange={cambiar} required className={inputClase} /></div>
          <div><button type="submit" className={botonClase}>{editandoId ? 'Guardar' : 'Agregar'}</button></div>
        </div>
      </form>

      <table className="w-full text-left text-sm">
        <thead className="bg-gray-100">
          <tr><th className="p-2">Nombre</th><th className="p-2">Unidad</th><th className="p-2">Stock</th><th className="p-2">Mínimo</th><th className="p-2">Costo</th><th className="p-2"></th></tr>
        </thead>
        <tbody>
          {insumos.map((i) => (
            <tr key={i.id} className="border-b border-gray-200">
              <td className="p-2">{i.nombre}</td>
              <td className="p-2">{i.unidad}</td>
              <td className="p-2">{Number(i.cantidad)}</td>
              <td className="p-2">{Number(i.stockMinimo)}</td>
              <td className="p-2">${Number(i.costoUnitario)}</td>
              <td className="p-2">
                <button className={`${botonGris} mr-2`} onClick={() => editar(i)}>Editar</button>
                <button className={botonRojo} onClick={() => eliminar(i.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default InsumosPage;