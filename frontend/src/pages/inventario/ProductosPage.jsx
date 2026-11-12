import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Col, Container, Form, Input, Row, Table } from 'reactstrap';
import { crearProducto, editarProducto, eliminarProducto, getProductos } from '../../api/inventarioApi';

const VACIO = { nombre: '', categoria: '', precio: '', tipo: 'ELABORADO', stockActual: '', stockMinimo: '' };

function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState('');

  const cargar = async () => {
    try {
      setProductos(await getProductos());
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar los productos');
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const guardar = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) await editarProducto(editandoId, form);
      else await crearProducto(form);
      setForm(VACIO);
      setEditandoId(null);
      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar');
    }
  };

  const editar = (p) => {
    setEditandoId(p.id);
    setForm({ nombre: p.nombre, categoria: p.categoria, precio: p.precio, tipo: p.tipo, stockActual: p.stockActual, stockMinimo: p.stockMinimo });
  };

  const eliminar = async (id) => {
    try {
      await eliminarProducto(id);
      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar');
    }
  };

  return (
    <Container className="py-4">
      <h2>Productos</h2>

      {error && <Alert color="danger" toggle={() => setError('')}>{error}</Alert>}

      <Form onSubmit={guardar} className="mb-4">
        <Row className="g-2">
          <Col md="3"><Input name="nombre" placeholder="Nombre" value={form.nombre} onChange={cambiar} required /></Col>
          <Col md="2"><Input name="categoria" placeholder="Categoría" value={form.categoria} onChange={cambiar} required /></Col>
          <Col md="2"><Input name="precio" type="number" step="0.01" placeholder="Precio" value={form.precio} onChange={cambiar} required /></Col>
          <Col md="2">
            <Input type="select" name="tipo" value={form.tipo} onChange={cambiar}>
              <option value="ELABORADO">Elaborado</option>
              <option value="REVENTA">Reventa</option>
            </Input>
          </Col>
          {/* Solo los de reventa tienen stock propio */}
          {form.tipo === 'REVENTA' && (
            <>
              <Col md="1"><Input name="stockActual" type="number" placeholder="Stock" value={form.stockActual} onChange={cambiar} /></Col>
              <Col md="1"><Input name="stockMinimo" type="number" placeholder="Mín." value={form.stockMinimo} onChange={cambiar} /></Col>
            </>
          )}
          <Col md="1"><Button color="primary" type="submit">{editandoId ? 'Guardar' : 'Agregar'}</Button></Col>
        </Row>
      </Form>

      <Table bordered hover>
        <thead>
          <tr><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Tipo</th><th>Stock</th><th></th></tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.categoria}</td>
              <td>${Number(p.precio).toFixed(2)}</td>
              <td>{p.tipo}</td>
              <td>{p.tipo === 'REVENTA' ? Number(p.stockActual) : '—'}</td>
              <td>
                {p.tipo === 'ELABORADO' && (
                  <Button size="sm" color="info" className="me-2" tag={Link} to={`/inventario/productos/${p.id}/receta`}>Receta</Button>
                )}
                <Button size="sm" color="secondary" className="me-2" onClick={() => editar(p)}>Editar</Button>
                <Button size="sm" color="danger" onClick={() => eliminar(p.id)}>Eliminar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default ProductosPage;