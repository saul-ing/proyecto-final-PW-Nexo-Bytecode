import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TODOS = ['ADMIN', 'GERENTE', 'CAJERO', 'BARISTA'];

const MENU = [
  { to: '/', texto: 'Dashboard', roles: TODOS },
  { to: '/pos', texto: 'POS', roles: TODOS },
  { to: '/ventas', texto: 'Ventas', roles: ['ADMIN', 'GERENTE', 'CAJERO'] },
  { to: '/inventario', texto: 'Inventario', roles: ['ADMIN', 'GERENTE'] },
  { to: '/compras', texto: 'Compras', roles: ['ADMIN', 'GERENTE'] },
  { to: '/caja', texto: 'Caja', roles: ['ADMIN', 'GERENTE', 'CAJERO'] },
  { to: '/rrhh', texto: 'RRHH', roles: ['ADMIN', 'GERENTE'] },
];

export default function Sidebar() {
  const { usuario } = useAuth();
  const visibles = MENU.filter((item) => item.roles.includes(usuario.rol));

  return (
    <aside className="w-56 bg-stone-900 text-stone-100 flex flex-col">
      <div className="px-5 py-4 text-lg font-bold border-b border-stone-700">Orígenes SV</div>
      <nav className="flex-1 p-3 space-y-1">
        {visibles.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `block rounded px-3 py-2 text-sm ${
                isActive ? 'bg-amber-600 text-white' : 'hover:bg-stone-800'
              }`
            }
          >
            {item.texto}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}