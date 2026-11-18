import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table, Button, Alert } from "reactstrap";
import api from '../api/ventasApi';

export default function HistorialVentas() {
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState('');
    const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

    useEffect(() => {
        cargarVentas();
    }, []);

    const cargarVentas = async () => {
        try {
            setLoading(true);
            setMensaje('');
            const res = await api.get('/ventas');
            setVentas(res.data.ventas);
        } catch (err){
            setMensaje(err.response?.data?.message || 'Ha habido un error al cargar el historial de ventas');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Container className="py-4">Cargando el historial de ventas...</Container>

    return (
    <Container className="py-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2>Historial de Ventas y Facturación</h2>
          <p className="text-muted">Registro de Comprobantes Consumidor Final y Crédito Fiscal</p>
        </Col>
        <Col xs="auto">
          <Button color="secondary" onClick={cargarVentas}>Actualizar</Button>
        </Col>
      </Row>

      {mensaje && <Alert color="danger">{mensaje}</Alert>}

      <Table responsive hover className="align-middle bg-white shadow-sm rounded">
        <thead className="table-light">
          <tr>
            <th>Documento</th>
            <th>Correlativo</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ventas.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-4 text-muted">Aún no hay ventas registradas.</td>
            </tr>
          ) : (
            ventas.map((v) => (
              <tr key={v.id}>
                <td>
                  <span className={`badge ${v.tipo === 'CCF' ? 'bg-warning text-dark' : 'bg-primary'}`}>
                    {v.tipo}
                  </span>
                </td>
                <td className="fw-bold">#{v.correlativo}</td>
                <td>{v.cliente?.nombre || 'Consumidor Final'}</td>
                <td className="fw-bold">${Number(v.total).toFixed(2)}</td>
                <td>{new Date(v.fecha).toLocaleString()}</td>
                <td>
                  <span className={`badge ${v.estado === 'EMITIDA' ? 'bg-success' : 'bg-danger'}`}>
                    {v.estado}
                  </span>
                </td>
                <td className="text-center">
                  <Button color="info" size="sm" onClick={() => setVentaSeleccionada(v)}>
                    Ver Factura
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {ventaSeleccionada && (
        <FacturaModal venta={ventaSeleccionada} onClose={() => setVentaSeleccionada(null)} />
      )}
    </Container>
  );
}