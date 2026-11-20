import { NavLink, Outlet } from 'react-router-dom';

const pestana = ({ isActive }) =>
  `px-4 py-2 text-sm font-medium border-b-2 ${
    isActive
      ? 'border-amber-600 text-amber-700'
      : 'border-transparent text-gray-600 hover:text-gray-900'
  }`;

// pestanas = [{ to: '/compras/lista', texto: 'Compras' }, ...]
export default function ModuloLayout({ titulo, pestanas }) {
  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-stone-700">{titulo}</h1>
      <nav className="mb-2 flex border-b border-gray-200">
        {pestanas.map((p) => (
          <NavLink key={p.to} to={p.to} className={pestana}>
            {p.texto}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}