import { Router } from 'express';
import { autenticar } from '../../middlewares/auth.js';
import * as sucursales from './sucursales.controller.js';

const router = Router();

// Cualquier usuario con sesión puede ver las sucursales
router.get('/', autenticar, sucursales.getSucursales);

export default router;
