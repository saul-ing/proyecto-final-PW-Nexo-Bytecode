import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Layout from '../components/Layout';
import Pendiente from '../components/Pendiente';
import Login from '../pages/login/Login';
import Dashboard from '../pages/dashboard/Dashboard';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pos" element={<Pendiente titulo="POS" />} />
            <Route path="/ventas" element={<Pendiente titulo="Ventas y facturación" />} />
            <Route path="/inventario" element={<Pendiente titulo="Inventario y recetas" />} />
            <Route path="/compras" element={<Pendiente titulo="Compras y proveedores" />} />
            <Route path="/caja" element={<Pendiente titulo="Caja y turnos" />} />
            <Route path="/rrhh" element={<Pendiente titulo="RRHH y planilla" />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}