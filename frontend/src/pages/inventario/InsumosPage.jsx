import { useEffect, useState } from 'react';
import { Alert, Button, Col, Container, Form, Input, Row, Table } from 'reactstrap';
import { crearInsumo, editarInsumo, eliminarInsumo, getAlertas, getInsumos } from '../../api/inventarioApi';

const VACIO = { nombre: '', unidad: 'GRAMO', stockActual: '', stockMinimo: '' };

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

  const editar = (insumo) => {
    setEditandoId(insumo.id);
    setForm({ nombre: insumo.nombre, unidad: insumo.unidad, stockActual: insumo.stockActual, stockMinimo: insumo.stockMinimo });
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
            {alertas.map((a) => (
              <li key={`${a.nombre}-${a.id}`}>{a.nombre}: quedan {Number(a.stockActual)} (mínimo {Number(a.stockMinimo)})</li>
            ))}
          </ul>
        </Alert>
      )}

      <Form onSubmit={guardar} className="mb-4">
        <Row className="g-2">
          <Col md="4"><Input name="nombre" placeholder="Nombre" value={form.nombre} onChange={cambiar} required /></Col>
          <Col md="2">
            <Input type="select" name="unidad" value={form.unidad} onChange={cambiar}>
              <option value="GRAMO">Gramos</option>
              <option value="MILILITRO">Mililitros</option>
              <option value="UNIDAD">Unidades</option>
            </Input>
          </Col>
          <Col md="2"><Input name="stockActual" type="number" step="any" placeholder="Stock" value={form.stockActual} onChange={cambiar} required /></Col>
          <Col md="2"><Input name="stockMinimo" type="number" step="any" placeholder="Mínimo" value={form.stockMinimo} onChange={cambiar} required /></Col>
          <Col md="2"><Button color="primary" type="submit">{editandoId ? 'Guardar' : 'Agregar'}</Button></Col>
        </Row>
      </Form>

      <Table bordered hover>
        <thead>
          <tr><th>Nombre</th><th>Unidad</th><th>Stock</th><th>Mínimo</th><th></th></tr>
        </thead>
        <tbody>
          {insumos.map((insumo) => (
            <tr key={insumo.id}>
              <td>{insumo.nombre}</td>
              <td>{insumo.unidad}</td>
              <td>{Number(insumo.stockActual)}</td>
              <td>{Number(insumo.stockMinimo)}</td>
              <td>
                <Button size="sm" color="secondary" className="me-2" onClick={() => editar(insumo)}>Editar</Button>
                <Button size="sm" color="danger" onClick={() => eliminar(insumo.id)}>Eliminar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default InsumosPage;