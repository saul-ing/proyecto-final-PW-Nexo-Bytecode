import { Router } from 'express';
import { autenticar, permitirRoles } from '../../middlewares/auth.js';
import * as pos from './pos.controller.js';

const router = Router();

router.use(autenticar, permitirRoles('ADMIN', 'GERENTE', 'CAJERO'));

router.get('/categorias', pos.getCategorias);

export default router;