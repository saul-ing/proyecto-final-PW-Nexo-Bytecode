import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

export default function FacturaModal({ venta, onClose }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={true} toggle={onClose} size="lg">
      <ModalHeader toggle={onClose} className="print:hidden">
        Vista Previa de Comprobante
      </ModalHeader>
      
      <ModalBody className="p-4 font-monospace text-dark">
        <div className="text-center mb-3">
          <h4 className="fw-bold m-0">{venta.sucursal?.nombre || ''}</h4>
          {venta.sucursal?.direccion && (
            <small className="text-muted d-block">{venta.sucursal.direccion}</small>
          )}
          {venta.sucursal?.telefono && (
            <small className="text-muted d-block">Tel: {venta.sucursal.telefono}</small>
          )}
          <div className="border-bottom my-2"></div>
          <h5 className="fw-bold uppercase">
            {venta.tipo === 'CCF' ? 'COMPROBANTE DE CRÉDITO FISCAL' : 'FACTURA DE CONSUMIDOR FINAL'}
          </h5>
          <p className="text-primary fw-bold">N°: {venta.tipo}-{String(venta.correlativo).padStart(6, '0')}</p>
        </div>

        <div className="mb-3 small">
          <p className="mb-1"><strong>Fecha:</strong> {new Date(venta.fecha).toLocaleString()}</p>
          <p className="mb-1"><strong>Cajero(a):</strong> {venta.usuario?.nombre || 'N/D'}</p>
          
          {venta.tipo === 'CCF' && venta.cliente && (
            <div className="p-2 bg-light border rounded mt-2">
              <p className="mb-1"><strong>Cliente:</strong> {venta.cliente.nombre}</p>
              <p className="mb-1"><strong>NIT:</strong> {venta.cliente.nit || 'N/D'} {venta.cliente.nrc ? `| NRC: ${venta.cliente.nrc}` : ''}</p>
              {venta.cliente.giro && <p className="mb-1"><strong>Giro:</strong> {venta.cliente.giro}</p>}
              {venta.cliente.direccion && <p className="mb-0"><strong>Dirección:</strong> {venta.cliente.direccion}</p>}
            </div>
          )}
        </div>

        <hr />

        <div className="table-responsive">
          <table className="table table-sm small">
            <thead>
              <tr>
                <th>DESCRIPCIÓN</th>
                <th className="text-center">CANT</th>
                <th className="text-end">P. UNIT</th>
                <th className="text-end">SUBTOTAL</th>
              </tr>
            </thead>
            <tbody>
              {venta.detalles && venta.detalles.length > 0 ? (
                venta.detalles.map((det) => (
                  <tr key={det.id}>
                    <td>{det.producto?.nombre || 'Producto'}</td>
                    <td className="text-center">{det.cantidad}</td>
                    <td className="text-end">${Number(det.precioUnitario).toFixed(2)}</td>
                    <td className="text-end">${Number(det.subtotal).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted">No hay detalles registrados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <hr />

        <div className="small space-y-1">
          <div className="d-flex justify-content-between">
            <span>Subtotal Neto:</span>
            <span>${Number(venta.subtotal).toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>IVA (13%):</span>
            <span>${Number(venta.iva).toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between fw-bold fs-6 border-top pt-2 mt-1">
            <span>TOTAL A PAGAR:</span>
            <span>${Number(venta.total).toFixed(2)}</span>
          </div>
        </div>

        <div className="text-center text-muted small mt-4">
          <p className="mb-0">¡Gracias por su compra!</p>
          <small>Documento Tributario Autorizado</small>
        </div>
      </ModalBody>

      <ModalFooter className="print:hidden">
        <Button color="primary" onClick={handlePrint}>Imprimir</Button>
        <Button color="secondary" onClick={onClose}>Cerrar</Button>
      </ModalFooter>
    </Modal>
  );
}