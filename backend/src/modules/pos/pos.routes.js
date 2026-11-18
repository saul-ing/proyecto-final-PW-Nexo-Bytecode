import { Router } from 'express';
import { autenticar, permitirRoles } from '../../middlewares/auth.js';
import * as pos from './pos.controller.js';

const router = Router();

router.use(autenticar, permitirRoles('ADMIN', 'GERENTE', 'CAJERO'));

router.get('/categorias', pos.getCategorias);
router.get('/productos', pos.getProductos);
router.get('/clientes', pos.getClientes);
router.post('/clientes', pos.crearCliente);

export default router;