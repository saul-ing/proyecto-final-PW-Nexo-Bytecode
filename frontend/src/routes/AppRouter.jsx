import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Layout from '../components/Layout';
import ModuloLayout from '../components/ModuloLayout';
import Login from '../pages/login/Login';
import Dashboard from '../pages/dashboard/Dashboard';
import PosPage from '../pages/pos/PosPage';
import HistorialVentas from '../pages/ventas/HistorialVentas';
import VistaFactura from '../pages/ventas/VistaFactura';
import TurnoPage from '../pages/caja/TurnoPage';
import ComprasPage from '../pages/compras/ComprasPage';
import ProveedoresPage from '../pages/compras/ProveedoresPage';
import CuentasPorPagarPage from '../pages/compras/CuentasPorPagarPage';
import EstadoCuentaProveedor from '../pages/compras/EstadoCuentaProveedor';
import InsumosPage from '../pages/inventario/InsumosPage';
import ProductosPage from '../pages/inventario/ProductosPage';
import RecetaPage from '../pages/inventario/RecetaPage';
import EmpleadosPage from '../pages/rrhh/EmpleadosPage';
import PlanillasPage from '../pages/rrhh/PlanillasPage';

const PESTANAS_INVENTARIO = [
  { to: '/inventario/insumos', texto: 'Insumos' },
  { to: '/inventario/productos', texto: 'Productos' },
  { to: '/inventario/recetas', texto: 'Recetas' },
];

const PESTANAS_COMPRAS = [
  { to: '/compras/facturas', texto: 'Compras' },
  { to: '/compras/proveedores', texto: 'Proveedores' },
  { to: '/compras/cuentas', texto: 'Cuentas por pagar' },
];

const PESTANAS_RRHH = [
  { to: '/rrhh/empleados', texto: 'Empleados' },
  { to: '/rrhh/planillas', texto: 'Planillas' },
];

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pos" element={<PosPage />} />

            {/* Ventas: ADMIN, GERENTE y CAJERO */}
            <Route element={<ProtectedRoute roles={['ADMIN', 'GERENTE', 'CAJERO']} />}>
              <Route path="/ventas" element={<HistorialVentas />} />
              <Route path="/ventas/:id" element={<VistaFactura />} />
            </Route>

            {/* Inventario: ADMIN y GERENTE */}
            <Route element={<ProtectedRoute roles={['ADMIN', 'GERENTE']} />}>
              <Route
                path="/inventario"
                element={<ModuloLayout titulo="Inventario y recetas" pestanas={PESTANAS_INVENTARIO} />}
              >
                <Route index element={<Navigate to="insumos" replace />} />
                <Route path="insumos" element={<InsumosPage />} />
                <Route path="productos" element={<ProductosPage />} />
                <Route path="recetas" element={<RecetaPage />} />
              </Route>
            </Route>

            {/* Compras: ADMIN y GERENTE */}
            <Route element={<ProtectedRoute roles={['ADMIN', 'GERENTE']} />}>
              <Route
                path="/compras"
                element={<ModuloLayout titulo="Compras y proveedores" pestanas={PESTANAS_COMPRAS} />}
              >
                <Route index element={<Navigate to="facturas" replace />} />
                <Route path="facturas" element={<ComprasPage />} />
                <Route path="proveedores" element={<ProveedoresPage />} />
                <Route path="proveedores/:id/estado-cuenta" element={<EstadoCuentaProveedor />} />
                <Route path="cuentas" element={<CuentasPorPagarPage />} />
              </Route>
            </Route>

            {/* Caja: ADMIN, GERENTE y CAJERO */}
            <Route element={<ProtectedRoute roles={['ADMIN', 'GERENTE', 'CAJERO']} />}>
              <Route path="/caja" element={<TurnoPage />} />
            </Route>

            {/* RRHH: ADMIN y GERENTE */}
            <Route element={<ProtectedRoute roles={['ADMIN', 'GERENTE']} />}>
              <Route
                path="/rrhh"
                element={<ModuloLayout titulo="RRHH y planilla" pestanas={PESTANAS_RRHH} />}
              >
                <Route index element={<Navigate to="empleados" replace />} />
                <Route path="empleados" element={<EmpleadosPage />} />
                <Route path="planillas" element={<PlanillasPage />} />
              </Route>
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}