// Clases de Tailwind compartidas por todas las pantallas de los módulos
export const inputClase =
  'w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-origen-700 focus:outline-none focus:ring-2 focus:ring-origen-500';

export const numeroClase =
  inputClase +
  ' [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

export const etiquetaClase = 'mb-1 block text-sm font-medium text-origen-700';

export const botonClase =
  'inline-flex items-center justify-center gap-2 rounded-full bg-origen-700 px-5 py-2 font-semibold text-white transition hover:bg-origen-950 disabled:opacity-50';
export const botonGris =
  'inline-flex items-center justify-center gap-1.5 rounded-full border border-origen-300 px-3 py-1.5 text-sm font-medium text-origen-700 transition hover:bg-origen-100 disabled:opacity-40';
export const botonRojo =
  'inline-flex items-center justify-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50';

export const tarjetaClase = 'rounded-2xl border border-gray-200 p-5';

export const contenedorTabla = 'overflow-x-auto rounded-2xl border border-gray-200';
export const tablaClase = 'w-full text-left text-sm';
export const theadClase = 'bg-origen-100 text-origen-700';
export const thClase = 'px-3 py-2.5 font-semibold';
export const tdClase = 'px-3 py-2.5';
export const filaClase = 'border-b border-gray-100 last:border-0 hover:bg-origen-100/40';