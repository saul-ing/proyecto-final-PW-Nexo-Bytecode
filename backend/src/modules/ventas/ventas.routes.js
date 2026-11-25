import { Router } from 'express';
// Nuevo: middleware de login de Saúl
import { autenticar, permitirRoles } from '../../middlewares/auth.js';
import * as ventas from './ventas.controller.js';

const router = Router();

router.use(autenticar);

// Vender y anular: solo los roles que usan caja (igual que el POS)
const conCaja = permitirRoles('ADMIN', 'GERENTE', 'CAJERO');

router.post('/', conCaja, ventas.crearVenta);
router.get('/', ventas.getVentas);
router.get('/:id', ventas.getVentaById);
router.patch('/:id/anular', conCaja, ventas.anularVenta);

export default router;
