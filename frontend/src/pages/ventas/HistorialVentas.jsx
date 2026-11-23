import { useEffect, useState } from 'react';
import { getVentas } from "../../api/ventasApi";
import VistaFactura from "./VistaFactura";

export default function HistorialVentas() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  const cargarVentas = async () => {
    try {
      const res = await getVentas();
      setVentas(res || []);
    } catch (err) {
      setMensaje(err.response?.data?.message ||"Ha habido un error al cargar el historial de ventas");
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  cargarVentas();
}, []);

  if (loading) {
    return <div className="p-6 text-gray-700">Cargando el historial de ventas...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Historial de Ventas y Facturación
          </h2>
          <p className="text-sm text-gray-600">
            Registro de Comprobantes Consumidor Final y Crédito Fiscal
          </p>
        </div>
        <button
          type="button"
          onClick={cargarVentas}
          className="rounded bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800"
        >
          Actualizar
        </button>
      </div>

      {mensaje && (
        <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-800">
          {mensaje}
        </div>
      )}

      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-gray-700">
              <th className="px-4 py-2">Documento</th>
              <th className="px-4 py-2">Correlativo</th>
              <th className="px-4 py-2">Cliente</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventas.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                  Aún no hay ventas registradas.
                </td>
              </tr>
            ) : (
              ventas.map((v) => (
                <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        v.tipo === "CCF"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {v.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-bold text-gray-900">#{v.correlativo}</td>
                  <td className="px-4 py-2 text-gray-700">
                    {v.cliente?.nombre || "Consumidor Final"}
                  </td>
                  <td className="px-4 py-2 font-bold text-gray-900">
                    ${Number(v.total).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {new Date(v.fecha).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        v.estado === "EMITIDA"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {v.estado}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => setVentaSeleccionada(v)}
                      className="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-800 hover:bg-gray-100"
                    >
                      Ver Factura
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {ventaSeleccionada && (
        <VistaFactura
          venta={ventaSeleccionada}
          onClose={() => setVentaSeleccionada(null)}
        />
      )}
    </div>
  );
}