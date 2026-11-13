import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/db.js';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/AppError.js';

const perfil = (u) => ({
  id: u.id,
  nombre: u.nombre,
  email: u.email,
  rol: u.rol,
  sucursalId: u.sucursalId,
  sucursal: u.sucursal ? u.sucursal.nombre : null,
});

export async function login(email, password) {
  if (!email || !password) {
    throw new AppError('Email y contraseña son obligatorios', 400);
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email },
    include: { sucursal: true },
  });

  const valido = usuario && usuario.activo && (await bcrypt.compare(password, usuario.password));
  if (!valido) {
    throw new AppError('Credenciales inválidas', 401);
  }

  const token = jwt.sign(
    { id: usuario.id, rol: usuario.rol, sucursalId: usuario.sucursalId },
    env.jwtSecret,
    { expiresIn: env.jwtExpires }
  );

  return { token, usuario: perfil(usuario) };
}

export async function obtenerPerfil(id) {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    include: { sucursal: true },
  });
  if (!usuario) throw new AppError('Usuario no encontrado', 404);
  return perfil(usuario);
}