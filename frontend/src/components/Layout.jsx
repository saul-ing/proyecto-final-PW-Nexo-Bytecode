import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Icono from './Icono';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { usuario } = useAuth();
  const inicial = usuario.nombre?.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen gap-3 bg-origen-100 p-3">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <header className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2 text-origen-700">
            <Icono nombre="storefront" />
            <span className="font-semibold">{usuario.sucursal}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <p className="text-sm font-semibold text-origen-950">{usuario.nombre}</p>
              <p className="text-xs text-origen-500">{usuario.rol}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-origen-700 font-bold text-origen-100">
              {inicial}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto rounded-3xl bg-white p-4 shadow-sm sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}