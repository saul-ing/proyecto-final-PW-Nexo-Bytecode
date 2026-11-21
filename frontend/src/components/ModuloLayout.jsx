import { NavLink, Outlet } from 'react-router-dom';

const pestana = ({ isActive }) =>
  `rounded-full px-4 py-1.5 text-sm font-medium transition ${
    isActive
      ? 'bg-origen-700 text-white'
      : 'bg-origen-100 text-origen-700 hover:bg-origen-300/60'
  }`;

// pestanas = [{ to: '/compras/lista', texto: 'Compras' }, ...]
export default function ModuloLayout({ titulo, pestanas }) {
  return (
    <div>
      <h1 className="mb-3 text-xl font-bold text-origen-950">{titulo}</h1>
      <nav className="mb-4 flex flex-wrap gap-2">
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