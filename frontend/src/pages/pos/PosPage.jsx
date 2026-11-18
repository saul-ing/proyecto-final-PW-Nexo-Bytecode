import { useEffect, useState } from 'react';
import { getCategorias, getProductosPos, registrarVenta } from '../../api/posApi';
import { getTurnoActual } from '../../api/cajaApi';
import { useCarrito } from '../../hooks/useCarrito';
import { dinero } from '../../utils/formato';
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

  if (cargando) return <div className="p-6">Cargando...</div>;

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Punto de venta</h1>

      {error && <div className="mb-4 rounded bg-red-100 p-3 text-red-800">{error}</div>}

      {!turno && (
        <div className="mb-4 rounded bg-amber-100 p-3 text-amber-900">
          No hay un turno abierto. Abre caja en Caja y turno para poder vender.
        </div>
      )}

      {ultimaVenta && (
        <div className="mb-4 flex items-start justify-between rounded border border-green-200 bg-green-50 p-3 text-green-900">
          <div>
            <p className="font-semibold">
              Venta registrada: {ultimaVenta.tipo} #{ultimaVenta.correlativo} por {dinero(ultimaVenta.total)}
            </p>
            {ultimaVenta.cambio > 0 && <p>Cambio entregado: {dinero(ultimaVenta.cambio)}</p>}
          </div>
          <button type="button" onClick={() => setUltimaVenta(null)} className="underline">
            Cerrar
          </button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CatalogoProductos
            productos={productosFiltrados}
            categorias={categorias}
            categoriaId={categoriaId}
            onCategoria={setCategoriaId}
            buscar={buscar}
            onBuscar={setBuscar}
            onAgregar={carrito.agregar}
          />
        </div>

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