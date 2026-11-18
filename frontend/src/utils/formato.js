export const dinero = (n) => `$${Number(n ?? 0).toFixed(2)}`;

// Evita arrastrar decimales raros (0.1 + 0.2) a dos decimales
export const redondear = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;