import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { usuario } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800">Bienvenido, {usuario.nombre}</h1>
      <p className="mt-2 text-gray-600">Panel principal de {usuario.sucursal}.</p>
    </div>
  );
}