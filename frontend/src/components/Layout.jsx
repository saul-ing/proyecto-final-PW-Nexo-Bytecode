import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { usuario, logout } = useAuth();

  return (
    <div className="flex h-screen bg-stone-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between bg-white px-6 py-3 shadow-sm">
          <span className="text-sm text-gray-600">
            {usuario.sucursal} · <strong>{usuario.nombre}</strong> ({usuario.rol})
          </span>
          <button
            onClick={logout}
            className="rounded bg-stone-800 px-3 py-1 text-sm text-white hover:bg-stone-700"
          >
            Cerrar sesión
          </button>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}