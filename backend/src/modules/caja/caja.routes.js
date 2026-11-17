import { Router } from 'express';
import { autenticar, permitirRoles } from '../../middlewares/auth.js';
import * as caja from './caja.controller.js';

const router = Router();

router.use(autenticar, permitirRoles('ADMIN', 'GERENTE', 'CAJERO'));

router.post('/turnos/abrir', caja.abrir);
router.get('/turnos/actual', caja.actual);
router.post('/turnos/cerrar', caja.cerrar);

export default router;