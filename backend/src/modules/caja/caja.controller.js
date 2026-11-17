import * as cajaService from './caja.service.js';

// POST /api/caja/turnos/abrir -> 201 | 400 | 409
export async function abrir(req, res, next) {
  try {
    const turno = await cajaService.abrirTurno(req.usuario, req.body.montoInicial);
    res.status(201).json({ ok: true, turno });
  } catch (error) {
    next(error);
  }
}

// GET /api/caja/turnos/actual -> 200 (turno es null si no hay uno abierto)
export async function actual(req, res, next) {
  try {
    const turno = await cajaService.turnoActual(req.usuario.id);
    res.json({ ok: true, turno });
  } catch (error) {
    next(error);
  }
}

// POST /api/caja/turnos/cerrar -> 200 | 400 | 404
export async function cerrar(req, res, next) {
  try {
    const { turno, diferencias } = await cajaService.cerrarTurno(req.usuario.id, req.body);
    res.json({ ok: true, turno, diferencias });
  } catch (error) {
    next(error);
  }
}