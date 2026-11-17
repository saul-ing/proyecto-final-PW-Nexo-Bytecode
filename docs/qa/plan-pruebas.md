# Plan de pruebas

Base: develop 7c53311. Prioridad P0: dinero, inventario, aislamiento de sucursal y planilla. Ejecutar escrituras exclusivamente en origenes_erp_qa con datos QA. No ejecutar seed/migraciones contra bases existentes sin revisar destino. Cada ejecución debe guardar fecha, commit (`git rev-parse HEAD`), Node/npm/PostgreSQL, caso, resultado, evidencia y responsable real. Estados: APROBADA, FALLIDA, BLOQUEADA (dependencia), NO EJECUTADA. Código inspeccionado no equivale a prueba aprobada.

Preparación: seguir despliegue-local.md, cargar fixtures, autenticar por API, conservar token solo localmente. Antes de cada caso registrar IDs y saldos iniciales. Para escrituras usar nuevas entidades QA; no restaurar stocks reejecutando el seed. No registrar tokens ni contraseñas en evidencia.

| Caso / prioridad | Precondiciones y datos | Pasos | Resultado esperado |
|---|---|---|---|
| API01 / P0 | API iniciada, sin DB necesaria | GET /api/health; GET ruta inexistente | 200 ok:true; 404 ok:false |
| API02 / P0 | Sin token y token inválido | GET /api/inventario/insumos y /api/auth/me | 401 sin acceso a datos |
| API03 / P0 | DB QA y usuario demo | Login vacío, incorrecto y válido; consultar /me con token | 400,401,200; perfil sin hash de contraseña |
| API04 / P1 | Usuario QA | Crear insumo sin nombre; repetir nombre; consultar producto inexistente | 400,409,404; sin registros parciales |
| INV01 / P0 | Fixtures cargados | Consultar productos/recetas e insumos | >=12 elaborados, recetas no vacías, G/ML/UNIDAD consistentes |
| INV02 / P0 | Venta integrada, Latte Grande QA | Vender 1; comparar stock y kardex | -18 G café, -250 ML leche, -1 vaso, tapa y viñeta; una salida por insumo |
| INV03 / P0 | Stock exacto de receta | Vender cantidad máxima; intentar una más | Llega a 0; siguiente venta rechazada, sin stock negativo ni factura/pago parcial |
| INV04 / P0 | Dos clientes concurrentes, stock para una venta | Enviar dos ventas simultáneas | Solo una confirma; otra falla; correlativos únicos y transacción íntegra |
| INV05 / P0 | Producto QA de reventa, stock 24 | Vender 2 unidades | Stock 22 en sucursal correcta, kardex -2 |
| INV06 / P1 | Stock menor/igual/mayor al mínimo | Consultar alertas con cada condición | Menor e igual aparecen; mayor no aparece |
| SUC01 / P0 | Dos usuarios QA de distintas sucursales | Comparar stocks; vender/comprar en A y consultar B | B conserva stock; confirmar política de catálogo global con equipo |
| VEN01 / P0 | POS/ventas integrados y turno abierto | Emitir CF total 11.30 y CCF válido | Base 10.00, IVA 1.30, total 11.30; correlativos por sucursal/tipo |
| VEN02 / P0 | CCF | Omitir datos fiscales; cantidad 0,-1; pago insuficiente | Rechazo claro y sin efectos parciales; política fiscal pendiente del módulo |
| VEN03 / P0 | Venta con pagos mixtos | Pagar 5 efectivo + 6.30 tarjeta, repetir envío | Total 11.30; documentar política ante reintentos, sin cobros involuntarios |
| COM01 / P0 | Compras integrada, proveedor QA | Comprar a crédito 1000 G; consultar stock y cuenta | +1000, kardex COMPRA, cuenta por monto correcto |
| COM02 / P0 | Compra registrada | Repetir documento/proveedor; abonar parcial y saldo final; sobreabonar | Sin compra duplicada; PARCIAL/PAGADA; exceso rechazado |
| CAJ01 / P0 | Caja integrada | Abrir con 100; vender 20 efectivo,10 tarjeta,5 Bitcoin,5 Chivo; cerrar | Esperado 120 efectivo,10 tarjeta,10 digital; diferencias 0 |
| CAJ02 / P0 | Turno cerrado | Intentar vender; cerrar con faltante de 1 | Rechazo venta cerrada; diferencia registrada según política acordada |
| NOM01 / P0 | RRHH integrado, fuente legal validada | Calcular quincena y deducciones para salario conocido | ISSS 3%, AFP 7.25%, ISR según base/topes/tabla oficialmente validados |
| NOM02 / P0 | Tramos ISR validados | Probar límite inferior, exacto y +0.01 de cada tramo | Sin saltos erróneos; redondeo y neto reproducibles; no usar cifras legales inventadas |
| UI01 / P1 | Interfaz integrada | Abrir login e inventario, navegar, probar API caída y pantalla pequeña | Navegación y errores claros, formularios usables; hoy bloqueada |
| TEC01 / P1 | Código del commit a entregar | Revisar requisitos técnicos y explicar flujo React→API→Prisma | Evidencia para cada requisito, comprensión individual |
| DEP01 / P0 | Windows limpio, PostgreSQL, Node | Clonar, instalar, configurar, migrar QA, compilar, arrancar, apagar | Flujo reproducible; health y UI responden; documentar cada error |
| ENT01 / P1 | Entregables completos | Revisar matriz, evidencias, Excel, IEEE, manual e historial | Sin resultados inventados, autores confirmados y declaración IA |

Pruebas automatizadas: `npm run qa:test` valida contrato HTTP de health, 404, login vacío y rechazo de tokens sin acceder a la DB. `npm run qa:fixtures` valida integridad del catálogo preparado, no la carga en PostgreSQL. Las pruebas financieras y E2E requieren módulos integrados; usar esta tabla como guion, sin inventar endpoints.

Ampliación automatizada de API02: se comprueban las 11 operaciones de inventario sin token y /auth/me con JWT expirado, firma ajena, Bearer vacío y esquema Basic. Esperado 401 sin datos de usuario ni stack. Esto no valida permisos de usuarios autenticados ni aislamiento real de sucursal. Consultar `npm run qa:entorno` para pendientes de configuración antes de pruebas con base.
