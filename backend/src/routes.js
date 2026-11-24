import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes.js';
import inventarioRoutes from './modules/inventario/inventario.routes.js';
import ventasRoutes from './modules/ventas/ventas.routes.js';
import cajaRoutes from './modules/caja/caja.routes.js';
import comprasRoutes from './modules/compras/compras.routes.js';
import rrhhRoutes from './modules/rrhh/rrhh.routes.js';
import posRoutes from './modules/pos/pos.routes.js';
import sucursalesRoutes from './modules/sucursales/sucursales.routes.js';

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true, message: 'API funcionando' }));

// Rutas de cada módulo
router.use('/auth', authRoutes);
router.use('/inventario', inventarioRoutes);
router.use('/ventas', ventasRoutes);
router.use('/caja', cajaRoutes);
router.use('/compras', comprasRoutes);
router.use('/rrhh', rrhhRoutes);
router.use('/pos', posRoutes);
router.use('/sucursales', sucursalesRoutes);

export default router;
