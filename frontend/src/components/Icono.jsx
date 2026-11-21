// Icono de Material Symbols
export default function Icono({ nombre, className = '', tamano }) {
  return (
    <span
      className={`material-symbols-rounded ${className}`}
      style={tamano ? { fontSize: tamano } : undefined}
      aria-hidden="true"
    >
      {nombre}
    </span>
  );
}