import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/auth/me')
      .then((r) => setUser(r.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const r = await api.post('/auth/login', { email, password });
    setUser(r.data.user);
    return r.data.user;
  }, []);

  // Registration only starts verification; the session begins after verifyOtp succeeds.
  const register = useCallback(async (payload) => (await api.post('/auth/register', payload)).data, []);

  const verifyOtp = useCallback(async (email, otp) => {
    const r = await api.post('/auth/verify-otp', { email, otp });
    setUser(r.data.user);
    return r.data.user;
  }, []);

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => {});
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, setUser, loading, login, register, verifyOtp, logout, isAdmin: user?.role === 'ADMIN' }}>{children}</AuthContext.Provider>;
}
