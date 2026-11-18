import { redondear } from './formato';

export const MEDIOS_PAGO = [
  { valor: 'EFECTIVO', etiqueta: 'Efectivo' },
  { valor: 'TARJETA', etiqueta: 'Tarjeta' },
  { valor: 'BITCOIN', etiqueta: 'Bitcoin' },
  { valor: 'CHIVO_WALLET', etiqueta: 'Chivo Wallet' },
];

// pagos = [{ medio, monto, referencia }] tal como los escribe el cajero.
// Si paga de más, el vuelto solo puede salir del efectivo. Al backend se manda
// el monto ya sin el vuelto, para que el cuadre de caja no quede inflado.
export function resumenPagos(pagos, total) {
  const filas = pagos.map((p) => ({ ...p, monto: redondear(p.monto) || 0 }));

  const pagado = redondear(filas.reduce((suma, p) => suma + p.monto, 0));
  const pendiente = Math.max(redondear(total - pagado), 0);
  const exceso = Math.max(redondear(pagado - total), 0);

  const efectivo = redondear(
    filas.filter((p) => p.medio === 'EFECTIVO').reduce((suma, p) => suma + p.monto, 0)
  );
  const cambio = exceso <= efectivo ? exceso : 0;

  let porDescontar = cambio;
  const pagosAEnviar = filas
    .map((p) => {
      if (p.medio !== 'EFECTIVO' || porDescontar === 0) return p;
      const resta = Math.min(p.monto, porDescontar);
      porDescontar = redondear(porDescontar - resta);
      return { ...p, monto: redondear(p.monto - resta) };
    })
    .filter((p) => p.monto > 0)
    .map((p) => ({ medio: p.medio, monto: p.monto, referencia: p.referencia?.trim() || null }));

  const valido = total > 0 && pendiente === 0 && exceso === cambio && pagosAEnviar.length > 0;

  return { pagado, pendiente, exceso, cambio, valido, pagosAEnviar };
}