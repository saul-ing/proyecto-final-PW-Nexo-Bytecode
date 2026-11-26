import { useEffect, useState } from 'react';
import { crearProveedor, editarProveedor, eliminarProveedor, getProveedores } from '../../api/comprasApi';
import EstadoCuentaProveedor from './EstadoCuentaProveedor';

import Icono from '../../components/Icono';
import { Alerta, Campo, Encabezado, FilaVacia } from '../../components/ui';
import {
  botonClase, botonGris, botonRojo, contenedorTabla, filaClase, inputClase,
  tablaClase, tarjetaClase, tdClase, theadClase, thClase,
} from '../../components/estilos';

const VACIO = { nombre: '', nit: '', nrc: '', telefono: '', email: '', diasCredito: 0 };

function ProveedoresPage() {
  const [proveedores, setProveedores] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [estadoCuentaId, setEstadoCuentaId] = useState(null); // proveedor abierto en "Estado de cuenta"

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
    <div>
      <Encabezado icono="local_shipping" titulo="Proveedores" descripcion="Quién nos vende y con qué condiciones de crédito" />

      {error && <Alerta tipo="error" onCerrar={() => setError('')}>{error}</Alerta>}

      <form onSubmit={guardar} className={`${tarjetaClase} mb-6 grid gap-3 md:grid-cols-3`}>
        <h3 className="font-semibold text-origen-950 md:col-span-3">{editandoId ? 'Editar proveedor' : 'Nuevo proveedor'}</h3>
        <Campo etiqueta="Nombre *">
          <input name="nombre" value={form.nombre} onChange={cambiar} required className={inputClase} />
        </Campo>
        <Campo etiqueta="NIT">
          <input name="nit" value={form.nit} onChange={cambiar} className={inputClase} />
        </Campo>
        <Campo etiqueta="NRC">
          <input name="nrc" value={form.nrc} onChange={cambiar} className={inputClase} />
        </Campo>
        <Campo etiqueta="Teléfono">
          <input name="telefono" value={form.telefono} onChange={cambiar} className={inputClase} />
        </Campo>
        <Campo etiqueta="Correo">
          <input name="email" type="email" value={form.email} onChange={cambiar} className={inputClase} />
        </Campo>
        <Campo etiqueta="Días de crédito (0 = contado)">
          <input name="diasCredito" type="number" min="0" step="1" value={form.diasCredito} onChange={cambiar} className={inputClase} />
        </Campo>
        <div className="flex gap-2 md:col-span-3">
          <button type="submit" disabled={enviando} className={botonClase}>
            <Icono nombre={editandoId ? 'save' : 'add'} tamano={20} />
            {editandoId ? 'Guardar cambios' : 'Agregar proveedor'}
          </button>
          {editandoId && (
            <button type="button" onClick={limpiar} className={`${botonGris} px-4 py-2`}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className={contenedorTabla}>
        <table className={tablaClase}>
          <thead className={theadClase}>
            <tr>
              <th className={thClase}>Nombre</th>
              <th className={thClase}>NIT</th>
              <th className={thClase}>NRC</th>
              <th className={thClase}>Teléfono</th>
              <th className={thClase}>Correo</th>
              <th className={thClase}>Crédito</th>
              <th className={thClase}></th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map((p) => (
              <tr key={p.id} className={filaClase}>
                <td className={`${tdClase} font-medium text-origen-950`}>{p.nombre}</td>
                <td className={tdClase}>{p.nit || '-'}</td>
                <td className={tdClase}>{p.nrc || '-'}</td>
                <td className={tdClase}>{p.telefono || '-'}</td>
                <td className={tdClase}>{p.email || '-'}</td>
                <td className={tdClase}>{p.diasCredito === 0 ? 'Contado' : `${p.diasCredito} días`}</td>
                <td className={`${tdClase} whitespace-nowrap text-right`}>
                  <button type="button" onClick={() => setEstadoCuentaId(p.id)} className={`${botonGris} mr-2`}>
                    <Icono nombre="request_quote" tamano={18} />
                    Estado de cuenta
                  </button>
                  <button type="button" onClick={() => editar(p)} className={`${botonGris} mr-2`}>
                    <Icono nombre="edit" tamano={18} />
                    Editar
                  </button>
                  <button type="button" onClick={() => eliminar(p)} className={botonRojo}>
                    <Icono nombre="block" tamano={18} />
                    Desactivar
                  </button>
                </td>
              </tr>
            ))}
            {proveedores.length === 0 && <FilaVacia columnas={7} texto="No hay proveedores registrados" />}
          </tbody>
        </table>
      </div>

      {estadoCuentaId && <EstadoCuentaProveedor proveedorId={estadoCuentaId} onCerrar={() => setEstadoCuentaId(null)} />}
    </div>
  );
}

export default ProveedoresPage;