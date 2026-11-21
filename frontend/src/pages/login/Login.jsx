import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icono from '../../components/Icono';

const inputClase =
  'w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3 focus:border-origen-700 focus:outline-none focus:ring-2 focus:ring-origen-500';

export default function Login() {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo conectar con el servidor');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-origen-950 p-12 text-origen-100 lg:flex">
        <div className="flex items-center gap-3 text-xl font-bold">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-origen-700">
            <Icono nombre="coffee" tamano={26} />
          </div>
          Orígenes SV
        </div>

        <div>
          <h2 className="text-4xl font-bold leading-tight">
            Gestiona tu negocio,
            <br />
            todo desde un solo lugar.
          </h2>
          <p className="mt-4 max-w-md text-origen-300">
            Ventas, inventario, compras, caja y planilla de todas las sucursales.
          </p>
        </div>

        <p className="text-sm text-origen-500">Nexo Bytecode · Programación Web</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-origen-100 px-6">
        <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="mb-1 text-2xl font-bold text-origen-950">Bienvenido</h1>
          <p className="mb-6 text-sm text-gray-500">Inicia sesión para continuar</p>

          {error && (
            <p className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              <Icono nombre="error" tamano={18} />
              {error}
            </p>
          )}

          <label className="mb-1 block text-sm font-medium text-gray-700">Correo</label>
          <div className="relative mb-4">
            <Icono nombre="mail" className="absolute left-3 top-1/2 -translate-y-1/2 text-origen-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClase}
            />
          </div>

          <label className="mb-1 block text-sm font-medium text-gray-700">Contraseña</label>
          <div className="relative mb-6">
            <Icono nombre="lock" className="absolute left-3 top-1/2 -translate-y-1/2 text-origen-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputClase}
            />
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-origen-700 py-2.5 font-semibold text-white transition hover:bg-origen-950 disabled:opacity-50"
          >
            {enviando ? 'Entrando...' : 'Entrar'}
            {!enviando && <Icono nombre="arrow_forward" tamano={20} />}
          </button>
        </form>
      </div>
    </div>
  );
}