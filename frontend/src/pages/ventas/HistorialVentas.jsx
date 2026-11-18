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
}