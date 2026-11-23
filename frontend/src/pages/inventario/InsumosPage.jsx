import { useEffect, useState } from 'react';
import { crearInsumo, editarInsumo, eliminarInsumo, getAlertas, getInsumos } from '../../api/inventarioApi';

import Icono from '../../components/Icono';
import { Alerta, Campo, Encabezado, FilaVacia, Insignia } from '../../components/ui';
import {
  botonClase, botonGris, botonRojo, contenedorTabla, filaClase, inputClase,
  tablaClase, tarjetaClase, tdClase, theadClase, thClase,
} from '../../components/estilos';

// Cambio: unidad G/ML/UNIDAD, se agrega costo, stockActual pasa a cantidad
const VACIO = { nombre: '', unidad: 'G', costoUnitario: '', cantidad: '', stockMinimo: '' };

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
    <div>
      <Encabezado icono="inventory_2" titulo="Insumos" descripcion="Materia prima, stock y costos de la sucursal" />

      {error && <Alerta tipo="error" onCerrar={() => setError('')}>{error}</Alerta>}

      {/* Panel de alertas de stock mínimo */}
      {alertas.length > 0 && (
        <Alerta tipo="aviso">
          <strong>Stock bajo:</strong>
          <ul className="ml-5 list-disc">
            {alertas.map((a) => (
              <li key={a.id}>{a.insumo.nombre}: quedan {Number(a.cantidad)} (mínimo {Number(a.stockMinimo)})</li>
            ))}
          </ul>
        </Alerta>
      )}

      <form onSubmit={guardar} className={`${tarjetaClase} mb-6`}>
        <h3 className="mb-3 font-semibold text-origen-950">{editandoId ? 'Editar insumo' : 'Nuevo insumo'}</h3>
        <div className="grid items-end gap-3 md:grid-cols-6">
          <Campo etiqueta="Nombre">
            <input name="nombre" placeholder="Café de especialidad" value={form.nombre} onChange={cambiar} required className={inputClase} />
          </Campo>
          <Campo etiqueta="Unidad">
            <select name="unidad" value={form.unidad} onChange={cambiar} className={inputClase}>
              <option value="G">Gramos</option>
              <option value="ML">Mililitros</option>
              <option value="UNIDAD">Unidades</option>
            </select>
          </Campo>
          <Campo etiqueta="Costo unitario">
            <input name="costoUnitario" type="number" step="any" value={form.costoUnitario} onChange={cambiar} className={inputClase} />
          </Campo>
          {/* La cantidad solo al crear; luego cambia con compras y ventas */}
          {!editandoId && (
            <Campo etiqueta="Stock inicial">
              <input name="cantidad" type="number" step="any" value={form.cantidad} onChange={cambiar} className={inputClase} />
            </Campo>
          )}
          <Campo etiqueta="Mínimo">
            <input name="stockMinimo" type="number" step="any" value={form.stockMinimo} onChange={cambiar} required className={inputClase} />
          </Campo>
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
              <th className={thClase}>Unidad</th>
              <th className={thClase}>Stock</th>
              <th className={thClase}>Mínimo</th>
              <th className={thClase}>Costo</th>
              <th className={thClase}></th>
            </tr>
          </thead>
          <tbody>
            {insumos.map((i) => {
              const bajo = Number(i.cantidad) <= Number(i.stockMinimo);
              return (
                <tr key={i.id} className={filaClase}>
                  <td className={`${tdClase} font-medium text-origen-950`}>{i.nombre}</td>
                  <td className={tdClase}>{i.unidad}</td>
                  <td className={tdClase}>
                    {Number(i.cantidad)} {bajo && <Insignia color="rojo">Bajo</Insignia>}
                  </td>
                  <td className={tdClase}>{Number(i.stockMinimo)}</td>
                  <td className={tdClase}>${Number(i.costoUnitario)}</td>
                  <td className={`${tdClase} whitespace-nowrap text-right`}>
                    <button type="button" className={`${botonGris} mr-2`} onClick={() => editar(i)}>
                      <Icono nombre="edit" tamano={18} />
                      Editar
                    </button>
                    <button type="button" className={botonRojo} onClick={() => eliminar(i.id)}>
                      <Icono nombre="delete" tamano={18} />
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
            {insumos.length === 0 && <FilaVacia columnas={6} texto="No hay insumos registrados" />}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InsumosPage;