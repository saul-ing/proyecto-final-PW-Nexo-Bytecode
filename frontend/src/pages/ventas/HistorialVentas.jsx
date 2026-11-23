import React, { useState, useEffect } from "react";
import { getVentas } from "../../api/ventasApi";
import VistaFactura from "./VistaFactura";

import Icono from '../../components/Icono';
import { Alerta, Encabezado, FilaVacia, Insignia } from '../../components/ui';
import { botonClase, botonGris, contenedorTabla, filaClase, tablaClase, tdClase, theadClase, thClase } from '../../components/estilos';
import { dinero } from '../../utils/formato';

export default function HistorialVentas() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    try {
      setLoading(true);
      setMensaje("");
      const res = await getVentas();
      setVentas(res || []);
    } catch (err) {
      setMensaje(
        err.response?.data?.message ||
          "Ha habido un error al cargar el historial de ventas"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-700">Cargando el historial de ventas...</div>;
  }

  return (
    <div>
      <Encabezado
        principal
        icono="receipt_long"
        titulo="Historial de ventas y facturación"
        descripcion="Comprobantes de consumidor final y crédito fiscal"
      >
        <button type="button" onClick={cargarVentas} className={botonClase}>
          <Icono nombre="refresh" tamano={20} />
          Actualizar
        </button>
      </Encabezado>

      {mensaje && <Alerta tipo="error">{mensaje}</Alerta>}

      <div className={contenedorTabla}>
        <table className={tablaClase}>
          <thead className={theadClase}>
            <tr>
              <th className={thClase}>Documento</th>
              <th className={thClase}>Correlativo</th>
              <th className={thClase}>Cliente</th>
              <th className={thClase}>Total</th>
              <th className={thClase}>Fecha</th>
              <th className={thClase}>Estado</th>
              <th className={`${thClase} text-center`}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventas.length === 0 ? (
              <FilaVacia columnas={7} texto="Aún no hay ventas registradas." />
            ) : (
              ventas.map((v) => (
                <tr key={v.id} className={filaClase}>
                  <td className={tdClase}>
                    <Insignia color={v.tipo === 'CCF' ? 'teal' : 'gris'}>{v.tipo}</Insignia>
                  </td>
                  <td className={`${tdClase} font-bold text-origen-950`}>#{v.correlativo}</td>
                  <td className={tdClase}>{v.cliente?.nombre || 'Consumidor final'}</td>
                  <td className={`${tdClase} font-bold text-origen-950`}>{dinero(v.total)}</td>
                  <td className={`${tdClase} text-gray-500`}>{new Date(v.fecha).toLocaleString('es-SV')}</td>
                  <td className={tdClase}>
                    <Insignia color={v.estado === 'EMITIDA' ? 'verde' : 'rojo'}>{v.estado}</Insignia>
                  </td>
                  <td className={`${tdClase} text-center`}>
                    <button type="button" onClick={() => setVentaSeleccionada(v)} className={botonGris}>
                      <Icono nombre="visibility" tamano={18} />
                      Ver factura
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {ventaSeleccionada && (
        <VistaFactura venta={ventaSeleccionada} onClose={() => setVentaSeleccionada(null)} />
      )}
    </div>
  );
}