import Icono from './Icono';
import { etiquetaClase } from './estilos';

// Título de cada pantalla con su icono. principal = título de página (h1)
export function Encabezado({ icono, titulo, descripcion, principal = false, children }) {
  const Titulo = principal ? 'h1' : 'h2';
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-origen-700 text-origen-100">
          <Icono nombre={icono} tamano={24} />
        </div>
        <div>
          <Titulo className={`font-bold text-origen-950 ${principal ? 'text-2xl' : 'text-lg'}`}>{titulo}</Titulo>
          {descripcion && <p className="text-sm text-gray-500">{descripcion}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

const TIPOS_ALERTA = {
  error: { clase: 'bg-red-50 text-red-700', icono: 'error' },
  ok: { clase: 'bg-origen-100 text-origen-950', icono: 'check_circle' },
  aviso: { clase: 'bg-yellow-100 text-yellow-800', icono: 'warning' },
  info: { clase: 'bg-blue-50 text-blue-800', icono: 'info' },
};

// Mensaje de error, éxito, aviso o información
export function Alerta({ tipo = 'error', onCerrar, children }) {
  const { clase, icono } = TIPOS_ALERTA[tipo];
  return (
    <div className={`mb-4 flex items-start gap-2 rounded-xl p-3 text-sm ${clase}`}>
      <Icono nombre={icono} tamano={20} />
      <div className="flex-1">{children}</div>
      {onCerrar && (
        <button type="button" onClick={onCerrar} aria-label="Cerrar aviso" className="opacity-60 hover:opacity-100">
          <Icono nombre="close" tamano={18} />
        </button>
      )}
    </div>
  );
}

// Etiqueta + campo del formulario
export function Campo({ etiqueta, className = '', children }) {
  return (
    <label className={`block ${className}`}>
      <span className={etiquetaClase}>{etiqueta}</span>
      {children}
    </label>
  );
}

const COLORES_INSIGNIA = {
  gris: 'bg-gray-100 text-gray-700',
  verde: 'bg-green-100 text-green-800',
  rojo: 'bg-red-100 text-red-700',
  amarillo: 'bg-yellow-100 text-yellow-800',
  azul: 'bg-blue-100 text-blue-800',
  teal: 'bg-origen-100 text-origen-700',
};

// Etiqueta de color para estados
export function Insignia({ color = 'gris', children }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${COLORES_INSIGNIA[color]}`}>
      {children}
    </span>
  );
}

// Ventana flotante. Se cierra al hacer clic fuera
export function Modal({ onCerrar, ancho = 'max-w-lg', children }) {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-origen-950/50 p-4" onClick={onCerrar}>
      <div
        className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-xl ${ancho}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// Fila de tabla cuando no hay datos
export function FilaVacia({ columnas, texto }) {
  return (
    <tr>
      <td colSpan={columnas} className="px-3 py-8 text-center text-gray-500">
        {texto}
      </td>
    </tr>
  );
}