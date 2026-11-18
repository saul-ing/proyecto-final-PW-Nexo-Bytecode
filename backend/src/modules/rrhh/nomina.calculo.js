import { Prisma } from '@prisma/client';

const { Decimal } = Prisma;
const D = (n) => new Decimal(n.toString());
const r2 = (x) => x.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

const ISSS_RATE = D('0.03');
const ISSS_BASE_MAX_QUINCENA = D('500'); // base máxima ISSS: $1,000/mes
const AFP_RATE = D('0.0725');
const ISSS_PATRONAL = D('0.075');
const AFP_PATRONAL = D('0.0875');

// tramos: filas de TramoRenta ya cargadas desde la BD
export function calcularRenta(base, tramos) {
  const t = tramos.find(
    (x) => base.gte(x.desde) && (x.hasta === null || base.lte(x.hasta))
  );
  if (!t) return D(0);
  const exceso = base.minus(t.sobreExceso);
  return r2(D(t.cuotaFija).plus(exceso.times(D(t.porcentaje).div(100))));
}

export function calcularQuincena(salarioMensual, tramos) {
  const salarioBruto = r2(D(salarioMensual).div(2));
  const baseIsss = Decimal.min(salarioBruto, ISSS_BASE_MAX_QUINCENA);
  const isss = r2(baseIsss.times(ISSS_RATE));
  const afp = r2(salarioBruto.times(AFP_RATE));
  const baseRenta = r2(salarioBruto.minus(isss).minus(afp));
  const renta = calcularRenta(baseRenta, tramos);
  const salarioNeto = salarioBruto.minus(isss).minus(afp).minus(renta);
  return { salarioBruto, isss, afp, renta, salarioNeto };
}

// Costo del patrono (no al empleado)
export function calcularPatronal(salarioBruto) {
  const baseIsss = Decimal.min(D(salarioBruto), ISSS_BASE_MAX_QUINCENA);
  return {
    isssPatronal: r2(baseIsss.times(ISSS_PATRONAL)),
    afpPatronal: r2(D(salarioBruto).times(AFP_PATRONAL)),
  };
}