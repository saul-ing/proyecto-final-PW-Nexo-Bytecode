import * as cajaService from './caja.service.js';

// POST /api/caja/turnos/abrir -> 201 | 400 | 409
// body: { montoInicial }
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