export default function VistaFactura({ venta, onClose }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 print:bg-transparent print:p-0">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded border border-gray-300 bg-white font-mono text-gray-900 print:max-h-none print:border-0">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-3 print:hidden">
          <h3 className="font-sans text-base font-semibold text-gray-900">
            Vista Previa de Comprobante
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="font-sans text-sm text-gray-600 hover:text-gray-900"
          >
            Cerrar
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 text-center">
            <h4 className="text-lg font-bold text-gray-900">
              {venta.sucursal?.nombre || "NEXO BYTECODE"}
            </h4>
            {venta.sucursal?.direccion && (
              <p className="text-xs text-gray-600">{venta.sucursal.direccion}</p>
            )}
            {venta.sucursal?.telefono && (
              <p className="text-xs text-gray-600">Tel: {venta.sucursal.telefono}</p>
            )}
            <div className="my-2 border-b border-gray-200" />
            <h5 className="text-sm font-bold uppercase text-gray-900">
              {venta.tipo === "CCF"
                ? "COMPROBANTE DE CRÉDITO FISCAL"
                : "FACTURA DE CONSUMIDOR FINAL"}
            </h5>
            <p className="text-xs font-bold text-amber-800">
              N°: {venta.tipo}-{String(venta.correlativo).padStart(6, "0")}
            </p>
          </div>

          <div className="mb-3 space-y-1 text-xs">
            <p>
              <strong>Fecha:</strong> {new Date(venta.fecha).toLocaleString()}
            </p>
            <p>
              <strong>Cajero(a):</strong> {venta.usuario?.nombre || "N/D"}
            </p>

            {venta.tipo === "CCF" && venta.cliente && (
              <div className="mt-2 space-y-0.5 rounded border border-gray-200 bg-gray-50 p-2">
                <p>
                  <strong>Cliente:</strong> {venta.cliente.nombre}
                </p>
                <p>
                  <strong>NIT:</strong> {venta.cliente.nit || "N/D"}{" "}
                  {venta.cliente.nrc ? `| NRC: ${venta.cliente.nrc}` : ""}
                </p>
                {venta.cliente.giro && (
                  <p>
                    <strong>Giro:</strong> {venta.cliente.giro}
                  </p>
                )}
                {venta.cliente.direccion && (
                  <p>
                    <strong>Dirección:</strong> {venta.cliente.direccion}
                  </p>
                )}
              </div>
            )}
          </div>

          <hr className="my-3 border-gray-200" />

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-700">
                  <th className="py-2">DESCRIPCIÓN</th>
                  <th className="py-2 text-center">CANT</th>
                  <th className="py-2 text-right">P. UNIT</th>
                  <th className="py-2 text-right">SUBTOTAL</th>
                </tr>
              </thead>
              <tbody>
                {venta.detalles && venta.detalles.length > 0 ? (
                  venta.detalles.map((det) => (
                    <tr key={det.id} className="border-b border-gray-100">
                      <td className="py-1.5">{det.producto?.nombre || "Producto"}</td>
                      <td className="py-1.5 text-center">{det.cantidad}</td>
                      <td className="py-1.5 text-right">
                        ${Number(det.precioUnitario).toFixed(2)}
                      </td>
                      <td className="py-1.5 text-right">
                        ${Number(det.subtotal).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-3 text-center text-gray-500">
                      No hay detalles registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <hr className="my-3 border-gray-200" />

          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Subtotal Neto:</span>
              <span>${Number(venta.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA (13%):</span>
              <span>${Number(venta.iva).toFixed(2)}</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-gray-300 pt-2 text-sm font-bold">
              <span>TOTAL A PAGAR:</span>
              <span>${Number(venta.total).toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-gray-600">
            <p className="mb-0">¡Gracias por su compra!</p>
            <small>Documento Tributario Autorizado</small>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-3 font-sans print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="rounded bg-amber-700 px-4 py-2 text-xs font-medium text-white hover:bg-amber-800"
          >
            Imprimir
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-gray-300 px-4 py-2 text-xs font-medium text-gray-800 hover:bg-gray-100"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}