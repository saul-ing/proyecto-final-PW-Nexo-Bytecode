import * as authService from './auth.service.js';

export async function login(req, res) {
  const { email, password } = req.body;
  const data = await authService.login(email, password);
  res.json({ ok: true, ...data });
}

export async function me(req, res) {
  const usuario = await authService.obtenerPerfil(req.usuario.id);
  res.json({ ok: true, usuario });
}