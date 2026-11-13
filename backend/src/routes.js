import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes.js';

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true, message: 'API funcionando' }));

router.use('/auth', authRoutes);
// Cada módulo agrega aquí su línea, por ejemplo:
// router.use('/proveedores', proveedoresRoutes);

export default router;
