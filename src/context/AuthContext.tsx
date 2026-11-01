import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as auth from '../services/auth';

export interface AuthContextValue {
  username: string | null;
  ready: boolean;
  login: (username: string, password: string) => Promise<auth.AuthResult>;
  register: (username: string, password: string) => Promise<auth.AuthResult>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [username, setUsername] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUsername(auth.getSessionUsername());
    setReady(true);
  }, []);

  const login = useCallback(async (name: string, password: string) => {
    const result = await auth.loginUser(name, password);
    if (result.ok) setUsername(result.user.username);
    return result;
  }, []);

  const register = useCallback(async (name: string, password: string) => {
    const result = await auth.registerUser(name, password);
    if (result.ok) setUsername(result.user.username);
    return result;
  }, []);

  const logout = useCallback(() => {
    auth.logout();
    setUsername(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ username, ready, login, register, logout }),
    [username, ready, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
