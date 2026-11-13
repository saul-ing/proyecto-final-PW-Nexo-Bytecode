import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

// Exige un token válido: Authorization: Bearer <token>
export function autenticar(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    throw new AppError('Token requerido', 401);
  }
  try {
    req.usuario = jwt.verify(token, env.jwtSecret); // { id, rol, sucursalId }
  } catch {
    throw new AppError('Token inválido o expirado', 401);
  }
  next();
}

// Uso: router.post('/', autenticar, permitirRoles('ADMIN', 'GERENTE'), handler)
export const permitirRoles =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      throw new AppError('No tiene permisos para esta acción', 403);
    }
    next();
  };