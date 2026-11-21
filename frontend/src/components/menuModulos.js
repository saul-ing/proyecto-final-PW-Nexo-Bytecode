// Módulos del sistema
const TODOS = ['ADMIN', 'GERENTE', 'CAJERO', 'BARISTA'];
const CON_CAJA = ['ADMIN', 'GERENTE', 'CAJERO'];
const GERENCIA = ['ADMIN', 'GERENTE'];

export const MODULOS = [
  { to: '/', texto: 'Dashboard', icono: 'space_dashboard', descripcion: 'Resumen del día', roles: TODOS },
  { to: '/pos', texto: 'POS', icono: 'point_of_sale', descripcion: 'Tomar pedidos y cobrar', roles: TODOS },
  { to: '/ventas', texto: 'Ventas', icono: 'receipt_long', descripcion: 'Historial y comprobantes', roles: CON_CAJA },
  { to: '/inventario', texto: 'Inventario', icono: 'inventory_2', descripcion: 'Insumos, productos y recetas', roles: GERENCIA },
  { to: '/compras', texto: 'Compras', icono: 'local_shipping', descripcion: 'Proveedores y cuentas por pagar', roles: GERENCIA },
  { to: '/caja', texto: 'Caja', icono: 'account_balance_wallet', descripcion: 'Apertura y cierre de turno', roles: CON_CAJA },
  { to: '/rrhh', texto: 'RRHH', icono: 'badge', descripcion: 'Empleados y planilla', roles: GERENCIA },
];