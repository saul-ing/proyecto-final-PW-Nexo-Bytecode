import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getInsumos, getProducto, guardarReceta } from '../../api/inventarioApi';

// Clases de Tailwind compartidas con caja y compras
const inputClase = 'w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600';
const botonClase = 'rounded bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800';
const botonGris = 'rounded border border-gray-300 px-3 py-1 hover:bg-gray-100';
const botonRojo = 'rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700';

// Ruta: /inventario/productos/:id/receta
function RecetaPage() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [insumos, setInsumos] = useState([]);
  const [lineas, setLineas] = useState([]); // [{ insumoId, cantidad }]
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const cargar = async () => {
      const [p, lista] = await Promise.all([getProducto(id), getInsumos()]);
      setProducto(p);
      setInsumos(lista);
      setLineas(p.receta.map((l) => ({ insumoId: l.insumoId, cantidad: Number(l.cantidad) })));
    };
    cargar();
  }, [id]);

  const cambiarLinea = (i, campo, valor) =>
    setLineas(lineas.map((l, j) => (j === i ? { ...l, [campo]: valor } : l)));

  const guardar = async () => {
    try {
      await guardarReceta(id, lineas);
      setMensaje('Receta guardada');
    } catch (err) {
      setMensaje(err.response?.data?.message || 'No se pudo guardar la receta');
    }
  };

  if (!producto) return <div className="p-6">Cargando...</div>;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Receta: {producto.nombre}</h1>
      <p className="mb-4 text-gray-500">Cantidades para 1 unidad</p>

      {mensaje && <div className="mb-4 rounded bg-blue-100 p-3 text-blue-800">{mensaje}</div>}

      {lineas.map((linea, i) => (
        <div key={i} className="mb-2 grid gap-2 md:grid-cols-12">
          <div className="md:col-span-6">
            <select value={linea.insumoId} onChange={(e) => cambiarLinea(i, 'insumoId', e.target.value)} className={inputClase}>
              <option value="">Seleccionar insumo</option>
              {insumos.map((ins) => (
                <option key={ins.id} value={ins.id}>{ins.nombre} ({ins.unidad})</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3">
            <input type="number" step="any" placeholder="Cantidad" value={linea.cantidad} onChange={(e) => cambiarLinea(i, 'cantidad', e.target.value)} className={inputClase} />
          </div>
          <div className="md:col-span-3">
            <button className={botonRojo} onClick={() => setLineas(lineas.filter((_, j) => j !== i))}>Quitar</button>
          </div>
        </div>
      ))}

      <button className={`${botonGris} mr-2`} onClick={() => setLineas([...lineas, { insumoId: '', cantidad: '' }])}>
        + Insumo
      </button>
      <button className={botonClase} onClick={guardar}>Guardar receta</button>
    </div>
  );
}

export default RecetaPage;