import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { RequireAuth } from './components/RequireAuth';
import { AuthProvider } from './context/AuthContext';
import { LocaleProvider } from './context/LocaleContext';
import { ShoppingProvider } from './context/ShoppingContext';
import { ThemeProvider } from './context/ThemeContext';
import {
  ByPriorityPage,
  ByStorePage,
  ListDetailPage,
  ListsPage,
  LoginPage,
  RegisterPage,
} from './pages';
import { RootRedirect } from './pages/RootRedirect';
import { isLocale } from './types';

/** Rutas con prefijo de idioma: `/:locale/...`. */
function LocaleRoutes() {
  const { locale } = useParams<{ locale: string }>();

  if (!isLocale(locale)) {
    return <RootRedirect />;
  }

  return (
    <LocaleProvider>
      <AuthProvider>
        <ShoppingProvider>
          <Routes>
            <Route path="login" element={<LoginPage />} />
            <Route path="registro" element={<RegisterPage />} />
            <Route
              path="listas"
              element={
                <RequireAuth>
                  <ListsPage />
                </RequireAuth>
              }
            />
            <Route
              path="lista/:id"
              element={
                <RequireAuth>
                  <ListDetailPage />
                </RequireAuth>
              }
            />
            <Route
              path="por-prioridad"
              element={
                <RequireAuth>
                  <ByPriorityPage />
                </RequireAuth>
              }
            />
            <Route
              path="por-lugar"
              element={
                <RequireAuth>
                  <ByStorePage />
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to={`/${locale}/listas`} replace />} />
          </Routes>
        </ShoppingProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/:locale/*" element={<LocaleRoutes />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
