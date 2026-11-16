import { Router } from 'express';
// Nuevo: middleware de login de Saúl
import { autenticar } from '../../middlewares/auth.js';
import * as ventas from './ventas.controller.js';

const router = Router();
 
router.use(autenticar);

router.post('/', ventas.crearVenta);
router.get('/', ventas.getVentas);
router.get('/:id', ventas.getVentaById);
router.patch('/:id/anular', ventas.anularVenta);

export default router;