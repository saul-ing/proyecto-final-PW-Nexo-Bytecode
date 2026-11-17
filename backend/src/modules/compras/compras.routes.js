import { Router } from 'express';
import { autenticar, permitirRoles } from '../../middlewares/auth.js';
import * as compras from './compras.controller.js';

const router = Router();

// Todas piden token y solo las usan administradores y gerentes
router.use(autenticar, permitirRoles('ADMIN', 'GERENTE'));

router.get('/proveedores', compras.getProveedores);
router.post('/proveedores', compras.crearProveedor);
router.put('/proveedores/:id', compras.editarProveedor);
router.delete('/proveedores/:id', compras.eliminarProveedor);
router.get('/proveedores/:id/estado-cuenta', compras.getEstadoCuenta);

router.get('/cuentas', compras.getCuentas);
router.post('/cuentas/:id/abonos', compras.crearAbono);

// Van al final para que /proveedores y /cuentas no se tomen como :id
router.get('/', compras.getCompras);
router.get('/:id', compras.getCompra);
router.post('/', compras.crearCompra);

export default router;
