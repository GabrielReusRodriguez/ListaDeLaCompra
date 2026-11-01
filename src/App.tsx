import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ShoppingProvider } from './context/ShoppingContext';
import { LocaleProvider } from './context/LocaleContext';
import {
  LoginPage,
  RegisterPage,
  ListsPage,
  ListDetailPage,
  ByPriorityPage,
  ByStorePage,
} from './pages';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { lang } = useParams<{ lang: string }>();
  const langPrefix = lang || 'es';

  if (!isAuthenticated) {
    return <Navigate to={`/${langPrefix}/login`} replace />;
  }

  return <>{children}</>;
}

function LanguageRedirect() {
  const { lang } = useParams<{ lang: string }>();
  const defaultLang = lang || 'es';

  return <Navigate to={`/${defaultLang}/login`} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LanguageRedirect />} />
      <Route path="/:lang/login" element={<LoginPage />} />
      <Route path="/:lang/registro" element={<RegisterPage />} />
      
      <Route
        path="/:lang/listas"
        element={
          <AuthGuard>
            <ListsPage />
          </AuthGuard>
        }
      />
      <Route
        path="/:lang/lista/:id"
        element={
          <AuthGuard>
            <ListDetailPage />
          </AuthGuard>
        }
      />
      <Route
        path="/:lang/por-prioridad"
        element={
          <AuthGuard>
            <ByPriorityPage />
          </AuthGuard>
        }
      />
      <Route
        path="/:lang/por-lugar"
        element={
          <AuthGuard>
            <ByStorePage />
          </AuthGuard>
        }
      />
      
      <Route path="*" element={<Navigate to="/es/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <LocaleProvider>
      <AuthProvider>
        <ShoppingProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ShoppingProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}

export default App;
