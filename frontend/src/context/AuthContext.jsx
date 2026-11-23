import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(() => Boolean(localStorage.getItem('token')));

  // Al abrir la app: si hay token guardado, recupera al usuario
  useEffect(() => {
  if (!localStorage.getItem('token')) return;
  api
    .get('/auth/me')
    .then(({ data }) => setUsuario(data.usuario))
    .catch(() => localStorage.removeItem('token'))
    .finally(() => setCargando(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUsuario(data.usuario);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);