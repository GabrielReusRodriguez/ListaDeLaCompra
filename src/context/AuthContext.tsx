import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, AuthAction } from '../types';
import { loginUser, registerUser, logout, getActiveUser, isAuthenticated as checkAuth } from '../services/auth';
import storage from '../services/storage';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    case 'REGISTER':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
      };
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const sessionUser = getActiveUser();
    if (sessionUser) {
      const user = storage.getUser(sessionUser);
      if (user) {
        dispatch({ type: 'LOGIN', payload: user });
      }
    }
  }, []);

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    const user = await loginUser(username, password);
    if (user) {
      storage.setSession(username);
      dispatch({ type: 'LOGIN', payload: user });
      return true;
    }
    return false;
  };

  const handleRegister = async (username: string, password: string): Promise<boolean> => {
    const user = await registerUser(username, password);
    if (user) {
      storage.setSession(username);
      dispatch({ type: 'REGISTER', payload: user });
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    logout();
    dispatch({ type: 'LOGOUT' });
  };



  const value: AuthContextType = {
    ...state,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
