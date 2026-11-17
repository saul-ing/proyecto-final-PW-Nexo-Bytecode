# Documentación técnica

Inspección: 2026-11-16, develop 7c53311. Stack declarado: React 19, Vite 8, Tailwind 4, Express 5, Prisma 6 y PostgreSQL. Las versiones exactas instaladas se registran en verificación; los rangos de package.json no prueban compatibilidad.

Flujo previsto: navegador — cliente Axios — Express /api — controlador — Prisma — PostgreSQL. App.jsx sigue siendo plantilla y no monta las páginas ni BrowserRouter. Las páginas de inventario existen, pero aún no constituyen una interfaz navegable. No hay módulos de ventas, compras, caja o RRHH montados en routes.js. Ramas remotas observadas por git ls-remote: ventas-facturacion, caja-turnos, compras-proveedores e inventario-recetas. No se inspeccionó ni integró su contenido; no se atribuye ausencia de trabajo a sus responsables.

Backend: app.js configura JSON y CORS únicamente para http://localhost:5173. server.js escucha PORT (3000 por defecto). env.js exige JWT_SECRET; dotenv resuelve .env desde el directorio de ejecución. Auth emite JWT por 8h con id, rol y sucursalId, verifica contraseña bcrypt y usuario activo durante login. autenticar valida token; permitirRoles existe, pero inventario solo aplica autenticar. Debe acordarse la autorización de escrituras por rol. No cambiar políticas de negocio sin aprobación.

Inventario: catálogo global, stock por sucursal obtenida del token, baja lógica por activo=false. Creación de insumo/stock/kardex en transacción; edición de insumo y mínimo son dos operaciones independientes. Receta se reemplaza en transacción. descontarStock recibe transacción del llamador, usa updateMany con cantidad>=consumo y registra VENTA. sumarStock hace upsert y registra COMPRA; el módulo llamador debe incluir factura/cuenta en esa misma transacción. No se ha probado atomicidad real ni concurrencia contra PostgreSQL.

Errores: AppError proporciona estado HTTP; P2002 se traduce a 409 y P2025 a 404; errores internos devuelven mensaje genérico 500. Decimales Prisma pueden serializarse como strings, el cliente los convierte a Number para mostrar. No asumir exactitud financiera sin pruebas de redondeo.

Configuración: DATABASE_URL y JWT_SECRET son secretos del backend; PORT es configurable. VITE_API_URL se incrusta al compilar y nunca debe contener secretos. No copiar .env al repositorio. Las cuentas QA son ficticias. El servidor local de scripts sirve dist y reenvía /api al backend: ambas peticiones comparten origen y no requieren cambiar CORS. Se limita a loopback; no constituye publicación ni hosting de producción.

Limitaciones registradas en docs/qa/incidencias.md. Ver api.md, db.md, despliegue-local.md y qa/plan-pruebas.md. No hay certificación de seguridad, fiscalidad ni instalación en otro equipo.
