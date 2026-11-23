import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icono from '../../components/Icono';
import logoNexo from '../../assets/logo-nexo.jpeg';

const inputClase =
  'w-full rounded-xl border border-origen-500/50 bg-white/95 p-2.5 text-origen-950 placeholder-origen-500 focus:border-origen-700 focus:outline-none focus:ring-1 focus:ring-origen-700';

export default function Login() {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [verAyuda, setVerAyuda] = useState(false);

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
    <main className="relative flex min-h-screen items-center justify-center bg-origen-100 p-4 text-origen-950">
      <section className="w-full max-w-3xl">
        <div className="flex items-center rounded-2xl border border-origen-500/30 bg-origen-300/55 p-5 shadow-xl backdrop-blur-sm">
          {/* Columna izquierda: formulario */}
          <div className="w-full px-6 md:w-1/2 md:px-10">
            <h1 className="text-2xl font-bold">Iniciar sesión</h1>
            <p className="mt-3 text-xs font-medium text-origen-700">¡Bienvenido de nuevo al equipo!</p>

            <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
              {error && (
                <p className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  <Icono nombre="error" tamano={18} />
                  {error}
                </p>
              )}

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-origen-700">Correo</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@origenes.sv"
                  autoComplete="username"
                  required
                  className={inputClase}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-origen-700">Contraseña</span>
                <div className="relative">
                  <input
                    type={verPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className={`${inputClase} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setVerPassword(!verPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-origen-500 hover:text-origen-700"
                    aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <Icono nombre={verPassword ? 'visibility_off' : 'visibility'} tamano={20} />
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={enviando}
                className="rounded-xl bg-origen-700 py-2.5 font-medium text-origen-100 shadow-sm duration-300 hover:scale-105 hover:bg-origen-950 disabled:opacity-60 disabled:hover:scale-100"
              >
                {enviando ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            {/* Ayuda en vez de un enlace que no lleva a ningún lado */}
            <div className="mt-6 border-t border-origen-500/40 pt-3.5 text-xs">
              <button
                type="button"
                onClick={() => setVerAyuda(!verAyuda)}
                className="text-origen-700 hover:text-origen-950"
              >
                ¿No tienes acceso o olvidaste tu contraseña?
              </button>
              {verAyuda && (
                <p className="mt-2 text-origen-700/90">
                  Pídele al administrador de tu sucursal que cree o restablezca tu usuario.
                </p>
              )}
            </div>
          </div>

          {/* Columna derecha: logo del equipo (solo en pantallas medianas o más) */}
          <div className="hidden w-1/2 self-stretch pl-2 md:block">
            <div className="flex h-full min-h-80 items-center justify-center rounded-2xl bg-white p-6 shadow-md">
              <img src={logoNexo} alt="Logo de Nexo Bytecode" className="max-h-72 w-full object-contain" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
