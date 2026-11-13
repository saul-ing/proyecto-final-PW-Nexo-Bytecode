import { Router } from 'express';
// Nuevo: middleware de login de Saúl
import { autenticar } from '../../middlewares/auth.js';
import * as inventario from './inventario.controller.js';

const router = Router();

// Nuevo: todas las rutas piden token (de ahí sale la sucursal)
router.use(autenticar);

router.get('/insumos', inventario.getInsumos);
router.post('/insumos', inventario.crearInsumo);
router.put('/insumos/:id', inventario.editarInsumo);
router.delete('/insumos/:id', inventario.eliminarInsumo);

router.get('/productos', inventario.getProductos);
router.get('/productos/:id', inventario.getProducto);
router.post('/productos', inventario.crearProducto);
router.put('/productos/:id', inventario.editarProducto);
router.delete('/productos/:id', inventario.eliminarProducto);
router.put('/productos/:id/receta', inventario.guardarReceta);

router.get('/alertas', inventario.getAlertas);

export default router;