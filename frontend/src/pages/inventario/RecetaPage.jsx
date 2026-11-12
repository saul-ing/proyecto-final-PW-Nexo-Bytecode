import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Button, Col, Container, Input, Row } from 'reactstrap';
import { getInsumos, getProducto, guardarReceta } from '../../api/inventarioApi';

// Ruta: /inventario/productos/:id/receta
function RecetaPage() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [insumos, setInsumos] = useState([]);
  const [lineas, setLineas] = useState([]); // [{ insumoId, cantidad }]
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const cargar = async () => {
      const [p, lista] = await Promise.all([getProducto(id), getInsumos()]);
      setProducto(p);
      setInsumos(lista);
      setLineas(p.receta.map((l) => ({ insumoId: l.insumoId, cantidad: Number(l.cantidad) })));
    };
    cargar();
  }, [id]);

  const cambiarLinea = (i, campo, valor) =>
    setLineas(lineas.map((l, j) => (j === i ? { ...l, [campo]: valor } : l)));

  const guardar = async () => {
    try {
      await guardarReceta(id, lineas);
      setMensaje('Receta guardada');
    } catch (err) {
      setMensaje(err.response?.data?.message || 'No se pudo guardar la receta');
    }
  };

  if (!producto) return <Container className="py-4">Cargando...</Container>;

  return (
    <Container className="py-4">
      <h2>Receta: {producto.nombre}</h2>
      <p className="text-muted">Cantidades para 1 unidad</p>

      {mensaje && <Alert color="info">{mensaje}</Alert>}

      {lineas.map((linea, i) => (
        <Row key={i} className="g-2 mb-2">
          <Col md="6">
            <Input type="select" value={linea.insumoId} onChange={(e) => cambiarLinea(i, 'insumoId', e.target.value)}>
              <option value="">Seleccionar insumo</option>
              {insumos.map((ins) => (
                <option key={ins.id} value={ins.id}>{ins.nombre} ({ins.unidad})</option>
              ))}
            </Input>
          </Col>
          <Col md="3">
            <Input type="number" step="any" placeholder="Cantidad" value={linea.cantidad} onChange={(e) => cambiarLinea(i, 'cantidad', e.target.value)} />
          </Col>
          <Col md="3">
            <Button color="danger" onClick={() => setLineas(lineas.filter((_, j) => j !== i))}>Quitar</Button>
          </Col>
        </Row>
      ))}

      <Button color="secondary" className="me-2" onClick={() => setLineas([...lineas, { insumoId: '', cantidad: '' }])}>
        + Insumo
      </Button>
      <Button color="primary" onClick={guardar}>Guardar receta</Button>
    </Container>
  );
}

export default RecetaPage;