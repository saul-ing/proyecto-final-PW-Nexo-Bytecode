import { useEffect, useState } from 'react';
import { getEstadoCuenta } from '../../api/comprasApi';

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
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4" onClick={onCerrar}>
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded bg-white p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
        {error && <div className="mb-4 rounded bg-red-100 p-3 text-red-800">{error}</div>}
        {!datos && !error && <p>Cargando...</p>}

        {datos && (
          <>
            <h2 className="text-xl font-bold">Estado de cuenta · {datos.proveedor.nombre}</h2>
            <p className="mb-4 text-sm text-gray-600">
              NIT {datos.proveedor.nit || '-'} · {datos.proveedor.diasCredito === 0 ? 'Contado' : `Crédito a ${datos.proveedor.diasCredito} días`}
            </p>

            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {tarjetas.map(([titulo, valor]) => (
                <div key={titulo} className="rounded border border-gray-200 p-3">
                  <p className="text-xs text-gray-600">{titulo}</p>
                  <p className="text-lg font-bold">{dinero(valor)}</p>
                </div>
              ))}
            </div>
            {datos.resumen.saldoVencido > 0 && (
              <div className="mb-4 rounded bg-red-100 p-3 text-red-800">Saldo vencido: {dinero(datos.resumen.saldoVencido)}</div>
            )}

            <h3 className="mb-2 font-semibold">Facturas y abonos</h3>
            {datos.compras.length === 0 && <p className="text-sm text-gray-500">Sin compras en esta sucursal</p>}
            <div className="space-y-2">
              {datos.compras.map((c) => (
                <div key={c.id} className="rounded border border-gray-200 p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">Factura {c.numeroDocumento} · {fecha(c.fecha)}</span>
                    <span className="font-bold">{dinero(c.total)}</span>
                  </div>
                  {!c.cuenta && <p className="text-gray-600">Pagada de contado</p>}
                  {c.cuenta && (
                    <>
                      <p className="text-gray-600">
                        Vence {fecha(c.cuenta.fechaVencimiento)} · saldo {dinero(c.cuenta.saldo)}{' '}
                        <span className={`ml-1 rounded px-2 py-0.5 text-xs font-semibold ${colorEstado[c.cuenta.estado]}`}>{c.cuenta.estado}</span>
                      </p>
                      {/* Historial de abonos de esta factura */}
                      {c.cuenta.abonos.length > 0 && (
                        <ul className="mt-1 ml-4 list-disc text-gray-700">
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

        <button onClick={onCerrar} className="mt-4 rounded bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800">
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default EstadoCuentaProveedor;
