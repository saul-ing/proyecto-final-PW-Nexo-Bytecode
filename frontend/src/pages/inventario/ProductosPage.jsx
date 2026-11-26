import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// Cambio: también se cargan insumos para elegir el de reventa
import { crearProducto, editarProducto, eliminarProducto, getInsumos, getProductos } from '../../api/inventarioApi';

import Icono from '../../components/Icono';
import { Alerta, Campo, Encabezado, FilaVacia, Insignia } from '../../components/ui';
import {
  botonClase, botonGris, botonRojo, contenedorTabla, filaClase, inputClase,
  tablaClase, tarjetaClase, tdClase, theadClase, thClase,
} from '../../components/estilos';

// Cambio: sin stock propio; REVENTA usa insumoReventaId
const VACIO = { nombre: '', categoria: '', precio: '', tipo: 'ELABORADO', insumoReventaId: '' };

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
    <div>
      <Encabezado icono="restaurant_menu" titulo="Productos" descripcion="Menú a la venta: elaborados y de reventa" />

      {error && <Alerta tipo="error" onCerrar={() => setError('')}>{error}</Alerta>}

      <form onSubmit={guardar} className={`${tarjetaClase} mb-6`}>
        <h3 className="mb-3 font-semibold text-origen-950">{editandoId ? 'Editar producto' : 'Nuevo producto'}</h3>
        <div className="grid items-end gap-3 md:grid-cols-6">
          <Campo etiqueta="Nombre">
            <input name="nombre" placeholder="Latte grande" value={form.nombre} onChange={cambiar} required className={inputClase} />
          </Campo>
          <Campo etiqueta="Categoría">
            <input name="categoria" placeholder="Bebidas calientes" value={form.categoria} onChange={cambiar} required className={inputClase} />
          </Campo>
          <Campo etiqueta="Precio (con IVA)">
            <input name="precio" type="number" step="0.01" value={form.precio} onChange={cambiar} required className={inputClase} />
          </Campo>
          <Campo etiqueta="Tipo">
            <select name="tipo" value={form.tipo} onChange={cambiar} className={inputClase}>
              <option value="ELABORADO">Elaborado</option>
              <option value="REVENTA">Reventa</option>
            </select>
          </Campo>
          {/* Reventa elige el insumo que descuenta */}
          {form.tipo === 'REVENTA' && (
            <Campo etiqueta="Insumo">
              <select name="insumoReventaId" value={form.insumoReventaId} onChange={cambiar} required className={inputClase}>
                <option value="">Seleccione...</option>
                {insumos.map((i) => (
                  <option key={i.id} value={i.id}>{i.nombre}</option>
                ))}
              </select>
            </Campo>
          )}
          <button type="submit" className={botonClase}>
            <Icono nombre={editandoId ? 'save' : 'add'} tamano={20} />
            {editandoId ? 'Guardar' : 'Agregar'}
          </button>
        </div>
      </form>

      <div className={contenedorTabla}>
        <table className={tablaClase}>
          <thead className={theadClase}>
            <tr>
              <th className={thClase}>Nombre</th>
              <th className={thClase}>Categoría</th>
              <th className={thClase}>Precio</th>
              <th className={thClase}>Tipo</th>
              <th className={thClase}></th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id} className={filaClase}>
                <td className={`${tdClase} font-medium text-origen-950`}>{p.nombre}</td>
                <td className={tdClase}>{p.categoria.nombre}</td>
                <td className={tdClase}>${Number(p.precio).toFixed(2)}</td>
                <td className={tdClase}>
                  {p.tipo === 'REVENTA' ? (
                    <Insignia color="azul">Reventa ({p.insumoReventa?.nombre})</Insignia>
                  ) : (
                    <Insignia color="teal">Elaborado</Insignia>
                  )}
                </td>
                <td className={`${tdClase} whitespace-nowrap text-right`}>
                  {p.tipo === 'ELABORADO' && (
                    <Link to={`/inventario/productos/${p.id}/receta`} className={`${botonGris} mr-2`}>
                      <Icono nombre="menu_book" tamano={18} />
                      Receta
                    </Link>
                  )}
                  <button type="button" className={`${botonGris} mr-2`} onClick={() => editar(p)}>
                    <Icono nombre="edit" tamano={18} />
                    Editar
                  </button>
                  <button type="button" className={botonRojo} onClick={() => eliminar(p.id)}>
                    <Icono nombre="delete" tamano={18} />
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {productos.length === 0 && <FilaVacia columnas={5} texto="No hay productos registrados" />}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductosPage;