import { Router } from 'express';
import { autenticar, permitirRoles } from '../../middlewares/auth.js';
import * as emp from './empleados.controller.js';
import * as plan from './planilla.controller.js';

const router = Router();
router.use(autenticar, permitirRoles('ADMIN', 'GERENTE')); // datos salariales: solo gerencia

router.get('/empleados', emp.listar);
router.get('/empleados/:id', emp.obtener);
router.post('/empleados', emp.crear);
router.put('/empleados/:id', emp.actualizar);
router.patch('/empleados/:id/desactivar', emp.desactivar);

router.get('/planillas', plan.listar);
router.post('/planillas/generar', plan.generar);
router.get('/planillas/:id', plan.detalle);
router.patch('/planillas/:id/pagar', plan.pagar);

export default router;