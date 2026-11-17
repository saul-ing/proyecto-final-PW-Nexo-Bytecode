import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// Cambio: también se cargan insumos para elegir el de reventa
import { crearProducto, editarProducto, eliminarProducto, getInsumos, getProductos } from '../../api/inventarioApi';

// Cambio: sin stock propio; REVENTA usa insumoReventaId
const VACIO = { nombre: '', categoria: '', precio: '', tipo: 'ELABORADO', insumoReventaId: '' };

// Clases de Tailwind compartidas con caja y compras
const inputClase = 'w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600';
const botonClase = 'rounded bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800';
const botonGris = 'rounded border border-gray-300 px-3 py-1 hover:bg-gray-100';
const botonRojo = 'rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700';

function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState('');

  const cargar = () =>
    Promise.all([getProductos(), getInsumos()])
      .then(([listaProductos, listaInsumos]) => {
        setProductos(listaProductos);
        setInsumos(listaInsumos);
      })
      .catch((err) => setError(err.response?.data?.message || 'No se pudieron cargar los productos'));

  // Carga productos e insumos al abrir la pantalla
  useEffect(() => {
    Promise.all([getProductos(), getInsumos()])
      .then(([listaProductos, listaInsumos]) => {
        setProductos(listaProductos);
        setInsumos(listaInsumos);
      })
      .catch((err) => setError(err.response?.data?.message || 'No se pudieron cargar los productos'));
  }, []);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const guardar = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) await editarProducto(editandoId, form);
      else await crearProducto(form);
      setForm(VACIO);
      setEditandoId(null);
      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar');
    }
  };

  const editar = (p) => {
    setEditandoId(p.id);
    // Cambio: categoría ahora es un objeto { id, nombre }
    setForm({ nombre: p.nombre, categoria: p.categoria.nombre, precio: p.precio, tipo: p.tipo, insumoReventaId: p.insumoReventaId ?? '' });
  };

  const eliminar = async (id) => {
    try {
      await eliminarProducto(id);
      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar');
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Productos</h1>

      {error && <div className="mb-4 rounded bg-red-100 p-3 text-red-800" onClick={() => setError('')}>{error}</div>}

      <form onSubmit={guardar} className="mb-4">
        <div className="grid gap-2 md:grid-cols-6">
          <div><input name="nombre" placeholder="Nombre" value={form.nombre} onChange={cambiar} required className={inputClase} /></div>
          <div><input name="categoria" placeholder="Categoría" value={form.categoria} onChange={cambiar} required className={inputClase} /></div>
          <div><input name="precio" type="number" step="0.01" placeholder="Precio" value={form.precio} onChange={cambiar} required className={inputClase} /></div>
          <div>
            <select name="tipo" value={form.tipo} onChange={cambiar} className={inputClase}>
              <option value="ELABORADO">Elaborado</option>
              <option value="REVENTA">Reventa</option>
            </select>
          </div>
          {/* Cambio: reventa elige el insumo que descuenta (antes era stock propio) */}
          {form.tipo === 'REVENTA' && (
            <div>
              <select name="insumoReventaId" value={form.insumoReventaId} onChange={cambiar} required className={inputClase}>
                <option value="">Insumo...</option>
                {insumos.map((i) => (
                  <option key={i.id} value={i.id}>{i.nombre}</option>
                ))}
              </select>
            </div>
          )}
          <div><button type="submit" className={botonClase}>{editandoId ? 'Guardar' : 'Agregar'}</button></div>
        </div>
      </form>

      <table className="w-full text-left text-sm">
        <thead className="bg-gray-100">
          <tr><th className="p-2">Nombre</th><th className="p-2">Categoría</th><th className="p-2">Precio</th><th className="p-2">Tipo</th><th className="p-2"></th></tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id} className="border-b border-gray-200">
              <td className="p-2">{p.nombre}</td>
              {/* Cambio: se muestra el nombre de la categoría y el insumo de reventa */}
              <td className="p-2">{p.categoria.nombre}</td>
              <td className="p-2">${Number(p.precio).toFixed(2)}</td>
              <td className="p-2">{p.tipo === 'REVENTA' ? `Reventa (${p.insumoReventa?.nombre})` : 'Elaborado'}</td>
              <td className="p-2">
                {p.tipo === 'ELABORADO' && (
                  <Link to={`/inventario/productos/${p.id}/receta`} className={`${botonGris} mr-2`}>Receta</Link>
                )}
                <button className={`${botonGris} mr-2`} onClick={() => editar(p)}>Editar</button>
                <button className={botonRojo} onClick={() => eliminar(p.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductosPage;