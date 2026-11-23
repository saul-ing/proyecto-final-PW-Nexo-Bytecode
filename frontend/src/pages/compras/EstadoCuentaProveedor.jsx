import { useEffect, useState } from 'react';
import { getEstadoCuenta } from '../../api/comprasApi';

import Icono from '../../components/Icono';
import { Alerta, Modal } from '../../components/ui';
import { botonClase } from '../../components/estilos';

const dinero = (n) => `$${Number(n ?? 0).toFixed(2)}`;
const fecha = (f) => (f ? new Date(f).toLocaleDateString('es-SV') : '-');

const colorEstado = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  PARCIAL: 'bg-blue-100 text-blue-800',
  PAGADA: 'bg-green-100 text-green-800',
};

// Ventana con el estado de cuenta de un proveedor. Se cierra con onCerrar
function EstadoCuentaProveedor({ proveedorId, onCerrar }) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getEstadoCuenta(proveedorId)
      .then(setDatos)
      .catch((err) => setError(err.response?.data?.message || 'No se pudo cargar el estado de cuenta'));
  }, [proveedorId]);

  const tarjetas = datos && [
    ['Total comprado', datos.resumen.totalComprado],
    ['Comprado al crédito', datos.resumen.totalCredito],
    ['Total abonado', datos.resumen.totalAbonado],
    ['Saldo pendiente', datos.resumen.saldoPendiente],
  ];

  return (
    <Modal onCerrar={onCerrar} ancho="max-w-3xl">
      {error && <Alerta tipo="error">{error}</Alerta>}
      {!datos && !error && <p className="text-gray-500">Cargando...</p>}

      {datos && (
        <>
          <h2 className="flex items-center gap-2 text-xl font-bold text-origen-950">
            <Icono nombre="request_quote" className="text-origen-500" />
            Estado de cuenta · {datos.proveedor.nombre}
          </h2>
          <p className="mb-4 text-sm text-gray-500">
            NIT {datos.proveedor.nit || '-'} · {datos.proveedor.diasCredito === 0 ? 'Contado' : `Crédito a ${datos.proveedor.diasCredito} días`}
          </p>

          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {tarjetas.map(([titulo, valor]) => (
              <div key={titulo} className="rounded-xl bg-origen-100 p-3">
                <p className="text-xs text-origen-500">{titulo}</p>
                <p className="text-lg font-bold text-origen-950">{dinero(valor)}</p>
              </div>
            ))}
          </div>
          {datos.resumen.saldoVencido > 0 && (
            <Alerta tipo="error">Saldo vencido: {dinero(datos.resumen.saldoVencido)}</Alerta>
          )}

          <h3 className="mb-2 font-semibold text-origen-950">Facturas y abonos</h3>
          {datos.compras.length === 0 && <p className="text-sm text-gray-500">Sin compras en esta sucursal</p>}
          <div className="space-y-2">
            {datos.compras.map((c) => (
              <div key={c.id} className="rounded-xl border border-gray-200 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-origen-950">Factura {c.numeroDocumento} · {fecha(c.fecha)}</span>
                  <span className="font-bold">{dinero(c.total)}</span>
                </div>
                {!c.cuenta && <p className="text-gray-500">Pagada de contado</p>}
                {c.cuenta && (
                  <>
                    <p className="text-gray-500">
                      Vence {fecha(c.cuenta.fechaVencimiento)} · saldo {dinero(c.cuenta.saldo)}{' '}
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorEstado[c.cuenta.estado]}`}>{c.cuenta.estado}</span>
                    </p>
                    {/* Historial de abonos de esta factura */}
                    {c.cuenta.abonos.length > 0 && (
                      <ul className="ml-4 mt-1 list-disc text-gray-700">
                        {c.cuenta.abonos.map((a) => (
                          <li key={a.id}>
                            {fecha(a.fecha)}: abono {dinero(a.monto)} ({a.medioPago}){a.nota && ` · ${a.nota}`}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <button type="button" onClick={onCerrar} className={`${botonClase} mt-4`}>
        Cerrar
      </button>
    </Modal>
  );
}

export default EstadoCuentaProveedor;