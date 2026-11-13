import { useEffect, useState } from 'react';
import { Alert, Button, Col, Container, Form, Input, Row, Table } from 'reactstrap';
import { crearInsumo, editarInsumo, eliminarInsumo, getAlertas, getInsumos } from '../../api/inventarioApi';

// Cambio: unidad G/ML/UNIDAD, se agrega costo, stockActual pasa a cantidad
const VACIO = { nombre: '', unidad: 'G', costoUnitario: '', cantidad: '', stockMinimo: '' };

function InsumosPage() {
  const [insumos, setInsumos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState('');

  // Carga insumos y alertas al mismo tiempo
  const cargar = async () => {
    try {
      const [lista, bajos] = await Promise.all([getInsumos(), getAlertas()]);
      setInsumos(lista);
      setAlertas(bajos);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar los insumos');
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const guardar = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) await editarInsumo(editandoId, form);
      else await crearInsumo(form);
      setForm(VACIO);
      setEditandoId(null);
      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar');
    }
  };

  const editar = (i) => {
    setEditandoId(i.id);
    setForm({ nombre: i.nombre, unidad: i.unidad, costoUnitario: i.costoUnitario, cantidad: i.cantidad, stockMinimo: i.stockMinimo });
  };

  const eliminar = async (id) => {
    try {
      await eliminarInsumo(id);
      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar');
    }
  };

  return (
    <Container className="py-4">
      <h2>Insumos</h2>

      {error && <Alert color="danger" toggle={() => setError('')}>{error}</Alert>}

      {/* Panel de alertas de stock mínimo */}
      {alertas.length > 0 && (
        <Alert color="warning">
          <strong>Stock bajo:</strong>
          <ul className="mb-0">
            {/* Cambio: la alerta trae el insumo adentro y usa cantidad */}
            {alertas.map((a) => (
              <li key={a.id}>{a.insumo.nombre}: quedan {Number(a.cantidad)} (mínimo {Number(a.stockMinimo)})</li>
            ))}
          </ul>
        </Alert>
      )}

      <Form onSubmit={guardar} className="mb-4">
        <Row className="g-2">
          <Col md="3"><Input name="nombre" placeholder="Nombre" value={form.nombre} onChange={cambiar} required /></Col>
          <Col md="2">
            <Input type="select" name="unidad" value={form.unidad} onChange={cambiar}>
              {/* Cambio: valores del enum de Saúl */}
              <option value="G">Gramos</option>
              <option value="ML">Mililitros</option>
              <option value="UNIDAD">Unidades</option>
            </Input>
          </Col>
          {/* Nuevo: costo unitario */}
          <Col md="2"><Input name="costoUnitario" type="number" step="any" placeholder="Costo unit." value={form.costoUnitario} onChange={cambiar} /></Col>
          {/* Cambio: la cantidad solo al crear; luego cambia con compras y ventas */}
          {!editandoId && (
            <Col md="2"><Input name="cantidad" type="number" step="any" placeholder="Stock inicial" value={form.cantidad} onChange={cambiar} /></Col>
          )}
          <Col md="2"><Input name="stockMinimo" type="number" step="any" placeholder="Mínimo" value={form.stockMinimo} onChange={cambiar} required /></Col>
          <Col md="1"><Button color="primary" type="submit">{editandoId ? 'Guardar' : 'Agregar'}</Button></Col>
        </Row>
      </Form>

      <Table bordered hover>
        <thead>
          <tr><th>Nombre</th><th>Unidad</th><th>Stock</th><th>Mínimo</th><th>Costo</th><th></th></tr>
        </thead>
        <tbody>
          {insumos.map((i) => (
            <tr key={i.id}>
              <td>{i.nombre}</td>
              <td>{i.unidad}</td>
              <td>{Number(i.cantidad)}</td>
              <td>{Number(i.stockMinimo)}</td>
              <td>${Number(i.costoUnitario)}</td>
              <td>
                <Button size="sm" color="secondary" className="me-2" onClick={() => editar(i)}>Editar</Button>
                <Button size="sm" color="danger" onClick={() => eliminar(i.id)}>Eliminar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default InsumosPage;