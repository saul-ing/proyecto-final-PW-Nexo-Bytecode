import { Router } from 'express';
import { autenticar, permitirRoles } from '../../middlewares/auth.js';
import * as sucursales from './sucursales.controller.js';

const router = Router();

// Cualquier usuario con sesión puede ver las sucursales
router.use(autenticar);
router.get('/', sucursales.getSucursales);
router.get('/:id', sucursales.getSucursal);

// Solo el administrador crea o edita
router.post('/', permitirRoles('ADMIN'), sucursales.postSucursal);
router.put('/:id', permitirRoles('ADMIN'), sucursales.putSucursal);

export default router;  