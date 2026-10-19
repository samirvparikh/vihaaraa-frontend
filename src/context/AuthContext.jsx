import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, setToken, setUnauthorizedHandler } from '../api';

// Customer sign-in for the storefront (Laravel Sanctum token). Admins use the admin panel instead.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(() => !!getToken());

  const signOutLocally = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(signOutLocally);
    if (!getToken()) return;
    api('/me')
      .then((d) => setUser(d.user))
      .catch(() => signOutLocally())
      .finally(() => setChecking(false));
  }, [signOutLocally]);

  const login = useCallback(async (email, password) => {
    const d = await api('/login', { method: 'POST', body: { email, password } });
    setToken(d.token);
    setUser(d.user);
    return d.user;
  }, []);

  const register = useCallback(async (fields) => {
    const d = await api('/register', { method: 'POST', body: fields });
    setToken(d.token);
    setUser(d.user);
    return d.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api('/logout', { method: 'POST' });
    } catch {
      /* token may already be gone — sign out locally either way */
    }
    signOutLocally();
  }, [signOutLocally]);

  const updateProfile = useCallback(async (fields) => {
    const d = await api('/me', { method: 'PUT', body: fields });
    setUser(d.user);
    return d;
  }, []);

  const value = useMemo(
    () => ({ user, checking, login, register, logout, updateProfile }),
    [user, checking, login, register, logout, updateProfile]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
