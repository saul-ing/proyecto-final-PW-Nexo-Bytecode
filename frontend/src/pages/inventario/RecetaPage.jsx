import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getInsumos, getProducto, guardarReceta } from '../../api/inventarioApi';

import Icono from '../../components/Icono';
import { Alerta, Encabezado } from '../../components/ui';
import { botonClase, botonGris, botonRojo, inputClase, tarjetaClase } from '../../components/estilos';

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
    <div>
      <Encabezado icono="menu_book" titulo={`Receta: ${producto.nombre}`} descripcion="Cantidades para 1 unidad" />

      {mensaje && <Alerta tipo="info" onCerrar={() => setMensaje('')}>{mensaje}</Alerta>}

      <div className={`${tarjetaClase} mb-4 space-y-3`}>
        {lineas.length === 0 && <p className="text-sm text-gray-500">Esta receta todavía no tiene insumos.</p>}

        {lineas.map((linea, i) => (
          <div key={i} className="grid items-center gap-3 md:grid-cols-12">
            <div className="md:col-span-6">
              <select value={linea.insumoId} onChange={(e) => cambiarLinea(i, 'insumoId', e.target.value)} className={inputClase}>
                <option value="">Seleccionar insumo</option>
                {insumos.map((ins) => (
                  <option key={ins.id} value={ins.id}>{ins.nombre} ({ins.unidad})</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-4">
              <input type="number" step="any" placeholder="Cantidad" value={linea.cantidad} onChange={(e) => cambiarLinea(i, 'cantidad', e.target.value)} className={inputClase} />
            </div>
            <div className="md:col-span-2">
              <button type="button" className={botonRojo} onClick={() => setLineas(lineas.filter((_, j) => j !== i))}>
                <Icono nombre="delete" tamano={18} />
                Quitar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className={botonGris} onClick={() => setLineas([...lineas, { insumoId: '', cantidad: '' }])}>
          <Icono nombre="add" tamano={18} />
          Insumo
        </button>
        <button type="button" className={botonClase} onClick={guardar}>
          <Icono nombre="save" tamano={20} />
          Guardar receta
        </button>
      </div>
    </div>
  );
}

export default RecetaPage;