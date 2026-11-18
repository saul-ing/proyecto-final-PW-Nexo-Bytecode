import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes.js';
// Nuevo: rutas del módulo de inventario
import inventarioRoutes from './modules/inventario/inventario.routes.js';
import ventasRoutes from './modules/ventas/ventas.routes.js';
import cajaRoutes from './modules/caja/caja.routes.js';          // 👈 NUEVA
import comprasRoutes from './modules/compras/compras.routes.js';
import posRoutes from './modules/pos/pos.routes.js';

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true, message: 'API funcionando' }));

router.use('/auth', authRoutes);
router.use('/inventario', inventarioRoutes);
router.use('/ventas', ventasRoutes);
// Cada módulo agrega aquí su línea, por ejemplo:
// router.use('/proveedores', proveedoresRoutes);
router.use('/caja', cajaRoutes);
router.use('/compras', comprasRoutes);
router.use('/pos', posRoutes);

export default router;
