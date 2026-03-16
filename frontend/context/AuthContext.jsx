import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api';

const AUTH_STORAGE_KEY = 'udev-auth';
const AuthContext = createContext(null);

function readStoredAuth() {
  if (typeof window === 'undefined') return { accessToken: null, user: null };

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { accessToken: null, user: null };
    const parsed = JSON.parse(raw);
    return {
      accessToken: parsed.accessToken || null,
      user: parsed.user || null
    };
  } catch (_error) {
    return { accessToken: null, user: null };
  }
}

function persistAuth(accessToken, user) {
  if (typeof window === 'undefined') return;

  if (!accessToken || !user) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ accessToken, user }));
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const clearAuth = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    persistAuth(null, null);
  }, []);

  const applyAuth = useCallback((token, authenticatedUser) => {
    setAccessToken(token);
    setUser(authenticatedUser);
    persistAuth(token, authenticatedUser);
  }, []);

  const refreshMe = useCallback(
    async (tokenOverride) => {
      const token = tokenOverride || accessToken;
      if (!token) return null;

      const me = await apiRequest('/api/auth/me', { token });
      applyAuth(token, me);
      return me;
    },
    [accessToken, applyAuth]
  );

  useEffect(() => {
    const bootstrap = async () => {
      const stored = readStoredAuth();
      if (!stored.accessToken) {
        setInitializing(false);
        return;
      }

      try {
        const me = await apiRequest('/api/auth/me', { token: stored.accessToken });
        applyAuth(stored.accessToken, me);
      } catch (_error) {
        clearAuth();
      } finally {
        setInitializing(false);
      }
    };

    bootstrap();
  }, [applyAuth, clearAuth]);

  const login = useCallback(
    async ({ email, password }) => {
      const payload = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      });
      applyAuth(payload.access_token, payload.user);
      return payload.user;
    },
    [applyAuth]
  );

  const register = useCallback(
    async ({ full_name, email, password }) => {
      const payload = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: { full_name, email, password }
      });
      applyAuth(payload.access_token, payload.user);
      return payload.user;
    },
    [applyAuth]
  );

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      initializing,
      isAuthenticated: Boolean(accessToken && user),
      isManager: Boolean(user && user.role === 'manager'),
      login,
      register,
      logout,
      refreshMe,
      apiRequestWithAuth: (path, options = {}) =>
        apiRequest(path, {
          ...options,
          token: options.token || accessToken
        })
    }),
    [accessToken, initializing, login, logout, refreshMe, register, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de AuthProvider');
  }
  return context;
}
