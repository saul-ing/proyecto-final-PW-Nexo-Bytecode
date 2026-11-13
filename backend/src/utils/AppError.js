// Error con código HTTP. Uso: throw new AppError('No existe', 404)
export class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}