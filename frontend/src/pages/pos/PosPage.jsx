import { useEffect, useState } from 'react';
import { getCategorias, getProductosPos, registrarVenta } from '../../api/posApi';
import { getTurnoActual } from '../../api/cajaApi';
import { useCarrito } from '../../hooks/useCarrito';
import { dinero } from '../../utils/formato';
import Icono from '../../components/Icono';
import CatalogoProductos from './CatalogoProductos';
import Carrito from './Carrito';
import CobroModal from './CobroModal';

function PosPage() {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [turno, setTurno] = useState(null);
  const [categoriaId, setCategoriaId] = useState(null);
  const [buscar, setBuscar] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('CF');
  const [cliente, setCliente] = useState(null);
  const [cobrando, setCobrando] = useState(false);
  const [ultimaVenta, setUltimaVenta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const carrito = useCarrito();

  useEffect(() => {
    Promise.all([getCategorias(), getProductosPos(), getTurnoActual()])
      .then(([cats, prods, turnoActual]) => {
        setCategorias(cats);
        setProductos(prods);
        setTurno(turnoActual);
      })
      .catch((err) => setError(err.response?.data?.message || 'No se pudo cargar el POS'))
      .finally(() => setCargando(false));
  }, []);

  // Filtros en pantalla: el menú es corto, no hace falta pedirlo de nuevo
  const productosFiltrados = productos.filter((p) => {
    const coincideCategoria = categoriaId === null || p.categoriaId === categoriaId;
    const coincideTexto = p.nombre.toLowerCase().includes(buscar.trim().toLowerCase());
    return coincideCategoria && coincideTexto;
  });

  const cambiarTipo = (tipo) => {
    setTipoDocumento(tipo);
    if (tipo === 'CF') setCliente(null);
  };

  const confirmarVenta = async (pagos, cambio) => {
    const venta = await registrarVenta({
      tipoDocumento,
      clienteId: tipoDocumento === 'CCF' ? cliente.id : null,
      items: carrito.items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })),
      pagos,
    });

    setUltimaVenta({ tipo: venta.tipo, correlativo: venta.correlativo, total: venta.total, cambio });
    carrito.vaciar();
    setCliente(null);
    setTipoDocumento('CF');
    setCobrando(false);

    // El stock cambió, se vuelve a pedir para actualizar los disponibles
    try {
      setProductos(await getProductosPos());
    } catch {
      setError('La venta se registró, pero no se pudo actualizar el catálogo');
    }
  };

  if (cargando) return <div className="p-6 text-gray-500">Cargando...</div>;

  return (
    <div>
      <h1 className="mb-4 flex items-center gap-2 text-2xl font-bold text-origen-950">
        <Icono nombre="point_of_sale" tamano={28} className="text-origen-500" />
        Punto de venta
      </h1>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-red-700">
          <Icono nombre="error" tamano={20} />
          {error}
        </div>
      )}

      {!turno && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-yellow-100 p-3 text-yellow-800">
          <Icono nombre="lock_clock" tamano={20} />
          No hay un turno abierto. Abre caja en el módulo Caja para poder vender.
        </div>
      )}

      {ultimaVenta && (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-xl bg-origen-100 p-3 text-origen-950">
          <div className="flex items-start gap-2">
            <Icono nombre="check_circle" className="text-origen-700" />
            <div>
              <p className="font-semibold">
                Venta registrada: {ultimaVenta.tipo} #{ultimaVenta.correlativo} por {dinero(ultimaVenta.total)}
              </p>
              {ultimaVenta.cambio > 0 && <p className="text-sm">Cambio entregado: {dinero(ultimaVenta.cambio)}</p>}
            </div>
          </div>
          <button type="button" onClick={() => setUltimaVenta(null)} aria-label="Cerrar aviso" className="text-origen-500 hover:text-origen-950">
            <Icono nombre="close" tamano={20} />
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <CatalogoProductos
          productos={productosFiltrados}
          categorias={categorias}
          categoriaId={categoriaId}
          onCategoria={setCategoriaId}
          buscar={buscar}
          onBuscar={setBuscar}
          items={carrito.items}
          onAgregar={carrito.agregar}
          onCambiarCantidad={carrito.cambiarCantidad}
        />

        <Carrito
          items={carrito.items}
          totales={carrito.totales}
          tipoDocumento={tipoDocumento}
          onTipoDocumento={cambiarTipo}
          cliente={cliente}
          onCliente={setCliente}
          onCambiarCantidad={carrito.cambiarCantidad}
          onQuitar={carrito.quitar}
          onVaciar={carrito.vaciar}
          onCobrar={() => setCobrando(true)}
          puedeCobrar={Boolean(turno)}
        />
      </div>

      {cobrando && (
        <CobroModal
          total={carrito.totales.total}
          tipoDocumento={tipoDocumento}
          onCerrar={() => setCobrando(false)}
          onConfirmar={confirmarVenta}
        />
      )}
    </div>
  );
}

export default PosPage;