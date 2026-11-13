export function notFound(req, res) {
  res.status(404).json({
    ok: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message;

  // Errores conocidos de Prisma
  if (err.code === 'P2002') {
    status = 409;
    message = 'Ya existe un registro con ese valor único';
  } else if (err.code === 'P2025') {
    status = 404;
    message = 'Registro no encontrado';
  }

  if (status === 500) {
    console.error(err);
    message = 'Error interno del servidor';
  }

  res.status(status).json({ ok: false, message });
}