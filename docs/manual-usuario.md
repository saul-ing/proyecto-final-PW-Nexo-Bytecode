# Manual de usuario — estado parcial

La versión inspeccionada abre la plantilla Vite. No existe aún navegación integrada de login/inventario; no se pueden ofrecer pasos de interfaz como si funcionaran. Cuando el equipo integre estas pantallas, validar este manual con UI01 y añadir capturas reales.

Funciones disponibles por API para operador técnico: iniciar sesión con POST /api/auth/login usando cuenta de prueba; utilizar token Bearer para consultar perfil, insumos, alertas y productos. Ver api.md para cuerpos exactos. Crear insumos con unidad G/ML/UNIDAD y stock inicial de la sucursal del usuario; editar mínimo/costo, crear productos y asignar receta por unidad. Reventa requiere insumo asociado. DELETE desactiva globalmente; usar solo datos QA durante pruebas.

La receta reemplaza todas sus líneas al guardar. La cantidad existente no se edita desde el formulario de insumos. Las alertas incluyen igualdad con el mínimo. Los catálogos son globales, mientras el stock depende de sucursal. Estos comportamientos se observaron en código, pendientes de validación en ejecución.

POS, facturas, compras, caja y planilla: instrucciones pendientes de integración y pruebas con sus responsables. No usar el sistema para operaciones reales basándose en este manual parcial.
