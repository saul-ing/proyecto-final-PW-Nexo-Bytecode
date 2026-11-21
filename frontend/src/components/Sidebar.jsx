import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icono from './Icono';
import { MODULOS } from './menuModulos';

export default function Sidebar() {
  const { usuario, logout } = useAuth();
  const visibles = MODULOS.filter((m) => m.roles.includes(usuario.rol));

  return (
    <aside className="flex w-16 shrink-0 flex-col bg-origen-950 text-origen-100 lg:w-60">
      <div className="flex items-center gap-3 px-3 py-5 lg:px-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-origen-700">
          <Icono nombre="coffee" />
        </div>
        <span className="hidden text-lg font-bold lg:block">Orígenes SV</span>
      </div>

      <nav className="flex-1 space-y-1 px-2 lg:px-3">
        {visibles.map((m) => (
          <NavLink
            key={m.to}
            to={m.to}
            end={m.to === '/'}
            title={m.texto}
            className={({ isActive }) =>
              `flex items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition lg:justify-start ${
                isActive
                  ? 'bg-origen-700 text-white'
                  : 'text-origen-300 hover:bg-origen-700/40 hover:text-white'
              }`
            }
          >
            <Icono nombre={m.icono} />
            <span className="hidden lg:block">{m.texto}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-origen-700/50 p-2 lg:p-3">
        <button
          type="button"
          onClick={logout}
          title="Cerrar sesión"
          className="flex w-full items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-origen-300 transition hover:bg-origen-700/40 hover:text-white lg:justify-start"
        >
          <Icono nombre="logout" />
          <span className="hidden lg:block">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}