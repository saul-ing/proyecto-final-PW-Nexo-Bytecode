import { Router } from 'express';
// Nuevo: middleware de login de Saúl
import { autenticar, permitirRoles } from '../../middlewares/auth.js';
import * as inventario from './inventario.controller.js';

const router = Router();

// Nuevo: todas las rutas piden token (de ahí sale la sucursal)
router.use(autenticar);

// Consultar lo puede cualquier rol; crear, editar y borrar solo gerencia
const gerencia = permitirRoles('ADMIN', 'GERENTE');

router.get('/insumos', inventario.getInsumos);
router.post('/insumos', gerencia, inventario.crearInsumo);
router.put('/insumos/:id', gerencia, inventario.editarInsumo);
router.delete('/insumos/:id', gerencia, inventario.eliminarInsumo);

router.get('/productos', inventario.getProductos);
router.get('/productos/:id', inventario.getProducto);
router.post('/productos', gerencia, inventario.crearProducto);
router.put('/productos/:id', gerencia, inventario.editarProducto);
router.delete('/productos/:id', gerencia, inventario.eliminarProducto);
router.put('/productos/:id/receta', gerencia, inventario.guardarReceta);

router.get('/alertas', inventario.getAlertas);

export default router;
